import { Request, Response } from 'express';
import { TemplateRepository } from '@/repositories/TemplateRepository';
import { PDSRepository } from '@/repositories/PDSRepository';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { auditService } from '@/services/audit';

export class TemplateController {
  private templateRepository: TemplateRepository;
  private pdsRepository: PDSRepository;

  constructor() {
    this.templateRepository = new TemplateRepository();
    this.pdsRepository = new PDSRepository();
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const includeDefaults = req.query.includeDefaults === 'true';

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const templates = await this.templateRepository.findByUserId(userId, includeDefaults);
      
      res.json({
        data: templates,
        count: templates.length
      });
    } catch (error) {
      logger.error('Get templates error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const template = await this.templateRepository.findById(id);
      
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      // Check if user owns this template or it's a system template
      if (template.user_id !== userId && !template.is_system) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json({ data: template });
    } catch (error) {
      logger.error('Get template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const templateData = {
        user_id: userId,
        name: req.body.name,
        description: req.body.description,
        is_default: req.body.isDefault || false,
        template_data: req.body.templateData
      };

      const template = await this.templateRepository.create(templateData);
      
      // Log the action
      await auditService.logAction({
        userId,
        action: 'create',
        entityType: 'template',
        entityId: template.id,
        details: {
          name: template.name,
          description: template.description
        }
      });

      res.status(201).json({
        message: 'Template created successfully',
        data: template
      });

      logger.info(`Template created: ${template.id} by user: ${userId}`);
    } catch (error) {
      logger.error('Create template error:', error);
      
      // Check for unique constraint violation
      if ((error as any).code === '23505') {
        res.status(409).json({ error: 'Template with this name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const existingTemplate = await this.templateRepository.findById(id);
      
      if (!existingTemplate) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      if (existingTemplate.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (existingTemplate.is_system) {
        res.status(403).json({ error: 'System templates cannot be modified' });
        return;
      }

      const updateData = {
        name: req.body.name,
        description: req.body.description,
        is_default: req.body.isDefault,
        template_data: req.body.templateData
      };

      const updatedTemplate = await this.templateRepository.update(id, updateData);
      
      // Log the action
      await auditService.logAction({
        userId,
        action: 'update',
        entityType: 'template',
        entityId: id,
        changes: updateData,
        details: {
          name: updatedTemplate?.name,
          description: updatedTemplate?.description
        }
      });

      res.json({
        message: 'Template updated successfully',
        data: updatedTemplate
      });

      logger.info(`Template updated: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Update template error:', error);
      
      // Check for unique constraint violation
      if ((error as any).code === '23505') {
        res.status(409).json({ error: 'Template with this name already exists' });
        return;
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const existingTemplate = await this.templateRepository.findById(id);
      
      if (!existingTemplate) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      if (existingTemplate.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (existingTemplate.is_system) {
        res.status(403).json({ error: 'System templates cannot be deleted' });
        return;
      }

      await this.templateRepository.delete(id);
      
      // Log the action
      await auditService.logAction({
        userId,
        action: 'delete',
        entityType: 'template',
        entityId: id,
        details: {
          name: existingTemplate.name,
          description: existingTemplate.description
        }
      });

      res.json({
        message: 'Template deleted successfully'
      });

      logger.info(`Template deleted: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Delete template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async applyTemplate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const { title, description, overrides } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const template = await this.templateRepository.findById(id);
      
      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      // Check if user has access to this template
      if (template.user_id !== userId && !template.is_system) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Merge template data with overrides
      const pdsData = {
        user_id: userId,
        title: title || `PDS from ${template.name}`,
        description: description || `Created from template: ${template.name}`,
        ...template.template_data,
        ...overrides,
        full_data: { ...template.template_data, ...overrides }
      };

      const pds = await this.pdsRepository.create(pdsData);
      
      // Update template usage statistics
      await this.templateRepository.incrementUsage(id);

      // Log both actions
      await auditService.logAction({
        userId,
        action: 'create',
        entityType: 'pds',
        entityId: pds.id,
        details: {
          title: pds.title,
          description: pds.description,
          fromTemplate: template.name
        }
      });

      res.status(201).json({
        message: 'PDS created from template successfully',
        data: pds
      });

      logger.info(`PDS created from template: ${template.id} by user: ${userId}`);
    } catch (error) {
      logger.error('Apply template error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}