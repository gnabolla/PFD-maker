import { Router } from 'express';
import { TemplateController } from '@/controllers/templateController';
import { authenticateToken } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validation';
import { pdsRateLimiter } from '@/middleware/rateLimiter';
import Joi from 'joi';

const router = Router();
const templateController = new TemplateController();

// Template validation schemas
const createTemplateSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  description: Joi.string().max(500),
  isDefault: Joi.boolean().default(false),
  templateData: Joi.object().required()
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500),
  isDefault: Joi.boolean(),
  templateData: Joi.object()
});

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Get all PDS templates for authenticated user
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeDefaults
 *         schema:
 *           type: boolean
 *         description: Include system default templates
 *     responses:
 *       200:
 *         description: List of PDS templates
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, pdsRateLimiter, templateController.getAll.bind(templateController));

/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Create new PDS template
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               isDefault:
 *                 type: boolean
 *               templateData:
 *                 type: object
 *     responses:
 *       201:
 *         description: Template created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, pdsRateLimiter, validateRequest(createTemplateSchema), templateController.create.bind(templateController));

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Get PDS template by ID
 *     tags: [Templates]
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
 *         description: Template details
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateToken, pdsRateLimiter, templateController.getById.bind(templateController));

/**
 * @swagger
 * /templates/{id}:
 *   put:
 *     summary: Update PDS template
 *     tags: [Templates]
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
 *         description: Template updated
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticateToken, pdsRateLimiter, validateRequest(updateTemplateSchema), templateController.update.bind(templateController));

/**
 * @swagger
 * /templates/{id}:
 *   delete:
 *     summary: Delete PDS template
 *     tags: [Templates]
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
 *         description: Template deleted
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateToken, pdsRateLimiter, templateController.delete.bind(templateController));

/**
 * @swagger
 * /templates/{id}/apply:
 *   post:
 *     summary: Create new PDS from template
 *     tags: [Templates]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               overrides:
 *                 type: object
 *                 description: Fields to override from template
 *     responses:
 *       201:
 *         description: PDS created from template
 *       404:
 *         description: Template not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/apply', authenticateToken, pdsRateLimiter, templateController.applyTemplate.bind(templateController));

export default router;