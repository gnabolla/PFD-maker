import { Server, Socket } from 'socket.io';
import { redisClient } from '@/database/redis';
import { v4 as uuidv4 } from 'uuid';

export interface UploadProgress {
  id: string;
  userId: string;
  fileName: string;
  totalBytes: number;
  uploadedBytes: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export class UploadProgressService {
  private io: Server | null = null;
  private readonly PROGRESS_KEY_PREFIX = 'upload:progress:';
  private readonly PROGRESS_TTL = 3600; // 1 hour TTL for progress data

  // Initialize socket.io server
  public setSocketServer(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  // Setup socket event handlers
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join user-specific room for progress updates
      socket.on('join:progress', (userId: string) => {
        socket.join(`progress:${userId}`);
        console.log(`Socket ${socket.id} joined progress room for user ${userId}`);
      });

      // Leave progress room
      socket.on('leave:progress', (userId: string) => {
        socket.leave(`progress:${userId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Create a new upload progress tracking session
  public async createUploadSession(userId: string, fileName: string, totalBytes: number): Promise<string> {
    const uploadId = uuidv4();
    const progress: UploadProgress = {
      id: uploadId,
      userId,
      fileName,
      totalBytes,
      uploadedBytes: 0,
      percentage: 0,
      status: 'pending',
      startedAt: new Date(),
    };

    await redisClient.setex(
      `${this.PROGRESS_KEY_PREFIX}${uploadId}`,
      this.PROGRESS_TTL,
      JSON.stringify(progress)
    );

    // Emit initial progress
    this.emitProgress(userId, progress);

    return uploadId;
  }

  // Update upload progress
  public async updateProgress(uploadId: string, uploadedBytes: number, status?: UploadProgress['status']) {
    const key = `${this.PROGRESS_KEY_PREFIX}${uploadId}`;
    const data = await redisClient.get(key);
    
    if (!data) {
      throw new Error('Upload session not found');
    }

    const progress: UploadProgress = JSON.parse(data);
    progress.uploadedBytes = uploadedBytes;
    progress.percentage = Math.round((uploadedBytes / progress.totalBytes) * 100);
    
    if (status) {
      progress.status = status;
      if (status === 'completed') {
        progress.completedAt = new Date();
      }
    } else if (progress.percentage >= 100) {
      progress.status = 'processing';
    } else if (progress.uploadedBytes > 0) {
      progress.status = 'uploading';
    }

    await redisClient.setex(key, this.PROGRESS_TTL, JSON.stringify(progress));
    
    // Emit progress update
    this.emitProgress(progress.userId, progress);

    return progress;
  }

  // Mark upload as completed
  public async completeUpload(uploadId: string) {
    const key = `${this.PROGRESS_KEY_PREFIX}${uploadId}`;
    const data = await redisClient.get(key);
    
    if (!data) {
      throw new Error('Upload session not found');
    }

    const progress: UploadProgress = JSON.parse(data);
    progress.status = 'completed';
    progress.percentage = 100;
    progress.completedAt = new Date();

    await redisClient.setex(key, this.PROGRESS_TTL, JSON.stringify(progress));
    
    // Emit completion
    this.emitProgress(progress.userId, progress);

    return progress;
  }

  // Mark upload as failed
  public async failUpload(uploadId: string, error: string) {
    const key = `${this.PROGRESS_KEY_PREFIX}${uploadId}`;
    const data = await redisClient.get(key);
    
    if (!data) {
      throw new Error('Upload session not found');
    }

    const progress: UploadProgress = JSON.parse(data);
    progress.status = 'failed';
    progress.error = error;
    progress.completedAt = new Date();

    await redisClient.setex(key, this.PROGRESS_TTL, JSON.stringify(progress));
    
    // Emit failure
    this.emitProgress(progress.userId, progress);

    return progress;
  }

  // Get upload progress
  public async getProgress(uploadId: string): Promise<UploadProgress | null> {
    const key = `${this.PROGRESS_KEY_PREFIX}${uploadId}`;
    const data = await redisClient.get(key);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  // Get all active uploads for a user
  public async getUserUploads(userId: string): Promise<UploadProgress[]> {
    const keys = await redisClient.keys(`${this.PROGRESS_KEY_PREFIX}*`);
    const uploads: UploadProgress[] = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const progress: UploadProgress = JSON.parse(data);
        if (progress.userId === userId) {
          uploads.push(progress);
        }
      }
    }

    return uploads.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  // Clean up old upload sessions
  public async cleanupOldSessions(olderThanHours: number = 24) {
    const keys = await redisClient.keys(`${this.PROGRESS_KEY_PREFIX}*`);
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) {
        const progress: UploadProgress = JSON.parse(data);
        const startedAt = new Date(progress.startedAt);
        
        if (startedAt < cutoffTime) {
          await redisClient.del(key);
          cleaned++;
        }
      }
    }

    return cleaned;
  }

  // Emit progress update via socket.io
  private emitProgress(userId: string, progress: UploadProgress) {
    if (this.io) {
      this.io.to(`progress:${userId}`).emit('upload:progress', progress);
    }
  }

  // Middleware to track multipart upload progress
  public trackMulterProgress(uploadId: string) {
    return async (req: any, res: any, next: any) => {
      let uploadedBytes = 0;
      
      req.on('data', async (chunk: Buffer) => {
        uploadedBytes += chunk.length;
        
        // Update progress every 100KB to avoid too many updates
        if (uploadedBytes % (100 * 1024) < chunk.length) {
          try {
            await this.updateProgress(uploadId, uploadedBytes);
          } catch (error) {
            console.error('Failed to update upload progress:', error);
          }
        }
      });

      req.on('end', async () => {
        try {
          await this.updateProgress(uploadId, uploadedBytes, 'processing');
        } catch (error) {
          console.error('Failed to finalize upload progress:', error);
        }
      });

      req.on('error', async (error: Error) => {
        try {
          await this.failUpload(uploadId, error.message);
        } catch (err) {
          console.error('Failed to mark upload as failed:', err);
        }
      });

      next();
    };
  }
}

// Export singleton instance
export const uploadProgressService = new UploadProgressService();