import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/authMiddleware';
import { uploadProgressService } from '@/services/uploadProgress';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @swagger
 * /upload/progress/{uploadId}:
 *   get:
 *     summary: Get upload progress for a specific upload session
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The upload session ID
 *     responses:
 *       200:
 *         description: Upload progress information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fileName:
 *                   type: string
 *                 totalBytes:
 *                   type: number
 *                 uploadedBytes:
 *                   type: number
 *                 percentage:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [pending, uploading, processing, completed, failed]
 *                 error:
 *                   type: string
 *                 startedAt:
 *                   type: string
 *                   format: date-time
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Upload session not found
 *       401:
 *         description: Unauthorized
 */
router.get('/progress/:uploadId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const progress = await uploadProgressService.getProgress(uploadId);
    
    if (!progress) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Verify user owns this upload session
    if (progress.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ data: progress });
  } catch (error) {
    logger.error('Get upload progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /upload/progress:
 *   get:
 *     summary: Get all active upload sessions for authenticated user
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active upload sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const uploads = await uploadProgressService.getUserUploads(userId);
    
    res.json({
      data: uploads,
      count: uploads.length
    });
  } catch (error) {
    logger.error('Get user uploads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /upload/progress/{uploadId}/cancel:
 *   post:
 *     summary: Cancel an upload session
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *         description: The upload session ID to cancel
 *     responses:
 *       200:
 *         description: Upload cancelled successfully
 *       404:
 *         description: Upload session not found
 *       401:
 *         description: Unauthorized
 */
router.post('/progress/:uploadId/cancel', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const progress = await uploadProgressService.getProgress(uploadId);
    
    if (!progress) {
      return res.status(404).json({ error: 'Upload session not found' });
    }

    // Verify user owns this upload session
    if (progress.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await uploadProgressService.failUpload(uploadId, 'Cancelled by user');
    
    res.json({ message: 'Upload cancelled successfully' });
  } catch (error) {
    logger.error('Cancel upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;