import { Router } from 'express';
import { PDSController } from '@/controllers/pdsController';
import { authenticateToken } from '@/middleware/authMiddleware';
import { validateRequest, createPDSSchema, updatePDSSchema, batchValidateSchema } from '@/middleware/validation';
import { batchRateLimiter, pdsRateLimiter } from '@/middleware/rateLimiter';

const router = Router();
const pdsController = new PDSController();

/**
 * @swagger
 * /pds:
 *   get:
 *     summary: Get all PDS records for authenticated user
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of records to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of records to skip
 *     responses:
 *       200:
 *         description: List of PDS records
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, pdsController.getAll.bind(pdsController));

/**
 * @swagger
 * /pds:
 *   post:
 *     summary: Create new PDS record
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               surname:
 *                 type: string
 *               firstName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *               placeOfBirth:
 *                 type: string
 *               civilStatus:
 *                 type: string
 *               height:
 *                 type: string
 *               weight:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               citizenship:
 *                 type: string
 *               residentialAddress:
 *                 type: object
 *               permanentAddress:
 *                 type: object
 *               father:
 *                 type: object
 *               mother:
 *                 type: object
 *     responses:
 *       201:
 *         description: PDS record created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, validateRequest(createPDSSchema), pdsController.create.bind(pdsController));

/**
 * @swagger
 * /pds/{id}:
 *   get:
 *     summary: Get PDS record by ID
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDS record details
 *       404:
 *         description: PDS record not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, pdsController.getById.bind(pdsController));

/**
 * @swagger
 * /pds/{id}:
 *   put:
 *     summary: Update PDS record
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: PDS record updated
 *       404:
 *         description: PDS record not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, validateRequest(updatePDSSchema), pdsController.update.bind(pdsController));

/**
 * @swagger
 * /pds/{id}:
 *   delete:
 *     summary: Delete PDS record
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDS record deleted
 *       404:
 *         description: PDS record not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, pdsController.delete.bind(pdsController));

/**
 * @swagger
 * /pds/{id}/validate:
 *   post:
 *     summary: Validate PDS record
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDS validation result
 *       404:
 *         description: PDS record not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/validate', authenticateToken, pdsRateLimiter, pdsController.validate.bind(pdsController));

/**
 * @swagger
 * /pds/batch/validate:
 *   post:
 *     summary: Validate multiple PDS records in batch
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pdsIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of PDS IDs to validate
 *                 maxItems: 50
 *     responses:
 *       200:
 *         description: Batch validation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProcessed:
 *                   type: number
 *                 validCount:
 *                   type: number
 *                 invalidCount:
 *                   type: number
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pdsId:
 *                         type: string
 *                       isValid:
 *                         type: boolean
 *                       errors:
 *                         type: array
 *                       processedAt:
 *                         type: string
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many requests
 */
router.post('/batch/validate', authenticateToken, batchRateLimiter, validateRequest(batchValidateSchema), pdsController.batchValidate.bind(pdsController));

/**
 * @swagger
 * /pds/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted PDS record
 *     tags: [PDS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDS record restored
 *       404:
 *         description: PDS record not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/restore', authenticateToken, pdsRateLimiter, pdsController.restore.bind(pdsController));

// Apply rate limiting to all PDS routes
router.use(pdsRateLimiter);

export default router;