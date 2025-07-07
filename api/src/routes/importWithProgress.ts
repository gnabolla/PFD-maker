import { Router } from 'express';
import multer from 'multer';
import { ImportController } from '@/controllers/importController';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/authMiddleware';
import { uploadProgressService } from '@/services/uploadProgress';
import { logger } from '@/utils/logger';

const router = Router();

// Configure multer for file uploads with progress tracking
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel, Word, and PDF files
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel, Word, and PDF files are allowed.'));
    }
  }
});

// Middleware to initiate upload progress tracking
const initUploadProgress = async (req: AuthenticatedRequest, res: any, next: any) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // Get file info from headers (sent by client before upload)
  const fileName = req.headers['x-file-name'] as string || 'Unknown File';
  const fileSize = parseInt(req.headers['x-file-size'] as string || '0');

  if (fileSize > 0) {
    try {
      // Create upload session
      const uploadId = await uploadProgressService.createUploadSession(userId, fileName, fileSize);
      
      // Attach uploadId to request
      (req as any).uploadId = uploadId;
      
      // Send uploadId in response header
      res.setHeader('X-Upload-Id', uploadId);
      
      // Track progress
      req.on('data', async (chunk: Buffer) => {
        const bytesReceived = (req.socket as any).bytesRead || 0;
        try {
          await uploadProgressService.updateProgress(uploadId, bytesReceived);
        } catch (error) {
          logger.error('Failed to update upload progress:', error);
        }
      });

      req.on('end', async () => {
        try {
          await uploadProgressService.updateProgress(uploadId, fileSize, 'processing');
        } catch (error) {
          logger.error('Failed to finalize upload progress:', error);
        }
      });

      req.on('error', async (error: Error) => {
        try {
          await uploadProgressService.failUpload(uploadId, error.message);
        } catch (err) {
          logger.error('Failed to mark upload as failed:', err);
        }
      });
    } catch (error) {
      logger.error('Failed to initialize upload progress:', error);
    }
  }

  next();
};

// Enhanced import endpoint with progress tracking
router.post('/pds', 
  authenticateToken, 
  initUploadProgress,
  upload.single('file'), 
  async (req: AuthenticatedRequest, res: any) => {
    const uploadId = (req as any).uploadId;
    
    try {
      // Call the original import controller
      await ImportController.importPDSFile(req, res);
      
      // Mark upload as completed
      if (uploadId) {
        await uploadProgressService.completeUpload(uploadId);
      }
    } catch (error) {
      // Mark upload as failed
      if (uploadId) {
        await uploadProgressService.failUpload(uploadId, error.message);
      }
      throw error;
    }
  }
);

// Other routes remain the same
router.get('/formats', authenticateToken, ImportController.getSupportedFormats);
router.post('/validate', authenticateToken, upload.single('file'), ImportController.validateUploadedFile);

export default router;