import { Router } from 'express';
import { ExportController } from '@/controllers/exportController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();
const exportController = new ExportController();

/**
 * @swagger
 * /export/pds/{id}/excel:
 *   get:
 *     summary: Export PDS to Excel format
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PDS record ID
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: PDS record not found
 *       403:
 *         description: Access denied
 */
router.get('/pds/:id/excel', authenticateToken, exportController.exportToExcel.bind(exportController));

/**
 * @swagger
 * /export/pds/{id}/word:
 *   get:
 *     summary: Export PDS to Word format
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PDS record ID
 *     responses:
 *       200:
 *         description: Word file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: PDS record not found
 *       403:
 *         description: Access denied
 */
router.get('/pds/:id/word', authenticateToken, exportController.exportToWord.bind(exportController));

/**
 * @swagger
 * /export/pds/{id}/pdf:
 *   get:
 *     summary: Export PDS to PDF format
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PDS record ID
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: PDS record not found
 *       403:
 *         description: Access denied
 */
router.get('/pds/:id/pdf', authenticateToken, exportController.exportToPDF.bind(exportController));

export default router;