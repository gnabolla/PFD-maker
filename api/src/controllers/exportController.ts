import { Response } from 'express';
import { FileExportService } from '@/services/fileExport';
import { PDSRepository } from '@/repositories/PDSRepository';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import * as fs from 'fs';

export class ExportController {
  private pdsRepository: PDSRepository;

  constructor() {
    this.pdsRepository = new PDSRepository();
  }

  async exportToExcel(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const pds = await this.pdsRepository.findById(id);
      
      if (!pds) {
        res.status(404).json({ error: 'PDS record not found' });
        return;
      }

      if (pds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (!pds.full_data) {
        res.status(400).json({ error: 'PDS data is incomplete' });
        return;
      }

      const exportResult = await FileExportService.exportPDS(pds.full_data, {
        format: 'excel',
        includeSignature: true
      });

      // Set response headers for file download
      res.setHeader('Content-Type', exportResult.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.setHeader('Content-Length', exportResult.size);

      // Stream the file
      const fileStream = fs.createReadStream(exportResult.filepath);
      fileStream.pipe(res);

      // Clean up file after download
      fileStream.on('end', () => {
        fs.unlink(exportResult.filepath, (err) => {
          if (err) logger.error('Failed to delete temporary file:', err);
        });
      });

      logger.info(`PDS exported to Excel: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Export to Excel error:', error);
      res.status(500).json({ error: 'Internal server error during export' });
    }
  }

  async exportToWord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const pds = await this.pdsRepository.findById(id);
      
      if (!pds) {
        res.status(404).json({ error: 'PDS record not found' });
        return;
      }

      if (pds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (!pds.full_data) {
        res.status(400).json({ error: 'PDS data is incomplete' });
        return;
      }

      const exportResult = await FileExportService.exportPDS(pds.full_data, {
        format: 'word',
        includeSignature: true
      });

      // Set response headers for file download
      res.setHeader('Content-Type', exportResult.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.setHeader('Content-Length', exportResult.size);

      // Stream the file
      const fileStream = fs.createReadStream(exportResult.filepath);
      fileStream.pipe(res);

      // Clean up file after download
      fileStream.on('end', () => {
        fs.unlink(exportResult.filepath, (err) => {
          if (err) logger.error('Failed to delete temporary file:', err);
        });
      });

      logger.info(`PDS exported to Word: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Export to Word error:', error);
      res.status(500).json({ error: 'Internal server error during export' });
    }
  }

  async exportToPDF(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const pds = await this.pdsRepository.findById(id);
      
      if (!pds) {
        res.status(404).json({ error: 'PDS record not found' });
        return;
      }

      if (pds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (!pds.full_data) {
        res.status(400).json({ error: 'PDS data is incomplete' });
        return;
      }

      const exportResult = await FileExportService.exportPDS(pds.full_data, {
        format: 'pdf',
        includeSignature: true
      });

      // Set response headers for file download
      res.setHeader('Content-Type', exportResult.mimetype);
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
      res.setHeader('Content-Length', exportResult.size);

      // Stream the file
      const fileStream = fs.createReadStream(exportResult.filepath);
      fileStream.pipe(res);

      // Clean up file after download
      fileStream.on('end', () => {
        fs.unlink(exportResult.filepath, (err) => {
          if (err) logger.error('Failed to delete temporary file:', err);
        });
      });

      logger.info(`PDS exported to PDF: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Export to PDF error:', error);
      res.status(500).json({ error: 'Internal server error during export' });
    }
  }
}