import { Request, Response } from 'express';
import { PDSRepository } from '@/repositories/PDSRepository';
import { PDSValidationService } from '@/services/pdsValidation';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { auditService } from '@/services/audit';

export class PDSController {
  private pdsRepository: PDSRepository;
  private validationService: PDSValidationService;

  constructor() {
    this.pdsRepository = new PDSRepository();
    this.validationService = new PDSValidationService();
  }

  async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { status, limit, offset } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const filters = {
        user_id: userId,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };

      const pdsRecords = await this.pdsRepository.findAll(filters);
      const totalCount = await this.pdsRepository.count({ user_id: userId, status: status as string });

      res.json({
        data: pdsRecords,
        pagination: {
          total: totalCount,
          limit: filters.limit,
          offset: filters.offset
        }
      });
    } catch (error) {
      logger.error('Get PDS records error:', error);
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

      const pds = await this.pdsRepository.findById(id);
      
      if (!pds) {
        res.status(404).json({ error: 'PDS record not found' });
        return;
      }

      // Check if user owns this PDS record
      if (pds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json({ data: pds });
    } catch (error) {
      logger.error('Get PDS record error:', error);
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

      const pdsData = {
        user_id: userId,
        title: req.body.title,
        description: req.body.description,
        surname: req.body.surname,
        first_name: req.body.firstName,
        name_extension: req.body.nameExtension,
        middle_name: req.body.middleName,
        date_of_birth: req.body.dateOfBirth,
        place_of_birth: req.body.placeOfBirth,
        civil_status: req.body.civilStatus,
        civil_status_details: req.body.civilStatusDetails,
        height: req.body.height,
        weight: req.body.weight,
        blood_type: req.body.bloodType,
        gsis_id: req.body.gsisId,
        pagibig_id: req.body.pagibigId,
        philhealth_id: req.body.philhealthId,
        sss_id: req.body.sssId,
        tin_id: req.body.tinId,
        agency_employee_id: req.body.agencyEmployeeId,
        citizenship: req.body.citizenship,
        dual_citizenship: req.body.dualCitizenship,
        telephone_number: req.body.telephoneNumber,
        mobile_number: req.body.mobileNumber,
        email_address: req.body.emailAddress,
        res_house_block_lot_number: req.body.residentialAddress?.houseBlockLotNumber,
        res_street: req.body.residentialAddress?.street,
        res_subdivision_village: req.body.residentialAddress?.subdivisionVillage,
        res_barangay: req.body.residentialAddress?.barangay,
        res_city_municipality: req.body.residentialAddress?.cityMunicipality,
        res_province: req.body.residentialAddress?.province,
        res_zip_code: req.body.residentialAddress?.zipCode,
        perm_house_block_lot_number: req.body.permanentAddress?.houseBlockLotNumber,
        perm_street: req.body.permanentAddress?.street,
        perm_subdivision_village: req.body.permanentAddress?.subdivisionVillage,
        perm_barangay: req.body.permanentAddress?.barangay,
        perm_city_municipality: req.body.permanentAddress?.cityMunicipality,
        perm_province: req.body.permanentAddress?.province,
        perm_zip_code: req.body.permanentAddress?.zipCode,
        father_surname: req.body.father?.surname,
        father_first_name: req.body.father?.firstName,
        father_name_extension: req.body.father?.nameExtension,
        father_middle_name: req.body.father?.middleName,
        mother_maiden_name: req.body.mother?.maidenName,
        mother_surname: req.body.mother?.surname,
        mother_first_name: req.body.mother?.firstName,
        mother_middle_name: req.body.mother?.middleName,
        signature: req.body.signature,
        right_thumb_mark: req.body.rightThumbMark,
        government_id_number: req.body.governmentIdNumber,
        government_id_issuance_date: req.body.governmentIdIssuanceDate,
        date_accomplished: req.body.dateAccomplished,
        passport_size_photo: req.body.passportSizePhoto,
        full_data: req.body
      };

      const pds = await this.pdsRepository.create(pdsData);
      
      // Log the creation
      await auditService.logPDSChange(userId, pds.id, 'create', null, pds, req);

      res.status(201).json({
        message: 'PDS record created successfully',
        data: pds
      });

      logger.info(`PDS record created: ${pds.id} by user: ${userId}`);
    } catch (error) {
      logger.error('Create PDS record error:', error);
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

      const existingPds = await this.pdsRepository.findById(id);
      
      if (!existingPds) {
        res.status(404).json({ error: 'PDS record not found' });
        return;
      }

      if (existingPds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        surname: req.body.surname,
        first_name: req.body.firstName,
        name_extension: req.body.nameExtension,
        middle_name: req.body.middleName,
        date_of_birth: req.body.dateOfBirth,
        place_of_birth: req.body.placeOfBirth,
        civil_status: req.body.civilStatus,
        civil_status_details: req.body.civilStatusDetails,
        height: req.body.height,
        weight: req.body.weight,
        blood_type: req.body.bloodType,
        gsis_id: req.body.gsisId,
        pagibig_id: req.body.pagibigId,
        philhealth_id: req.body.philhealthId,
        sss_id: req.body.sssId,
        tin_id: req.body.tinId,
        agency_employee_id: req.body.agencyEmployeeId,
        citizenship: req.body.citizenship,
        dual_citizenship: req.body.dualCitizenship,
        telephone_number: req.body.telephoneNumber,
        mobile_number: req.body.mobileNumber,
        email_address: req.body.emailAddress,
        full_data: req.body
      };

      const updatedPds = await this.pdsRepository.update(id, updateData);
      
      // Log the update
      await auditService.logPDSChange(userId, id, 'update', existingPds, updatedPds, req);

      res.json({
        message: 'PDS record updated successfully',
        data: updatedPds
      });

      logger.info(`PDS record updated: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Update PDS record error:', error);
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

      const existingPds = await this.pdsRepository.findById(id);
      
      if (!existingPds) {
        res.status(404).json({ error: 'PDS record not found' });
        return;
      }

      if (existingPds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      await this.pdsRepository.delete(id);
      
      // Log the soft delete
      await auditService.logPDSChange(userId, id, 'delete', existingPds, null, req);

      res.json({
        message: 'PDS record deleted successfully'
      });

      logger.info(`PDS record deleted: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Delete PDS record error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async validate(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const validationResult = await this.validationService.validatePDS(pds.full_data);
      
      res.json({
        message: 'PDS validation completed',
        validation: validationResult
      });

      logger.info(`PDS record validated: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Validate PDS record error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async batchValidate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { pdsIds } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!Array.isArray(pdsIds) || pdsIds.length === 0) {
        res.status(400).json({ error: 'Invalid request: pdsIds must be a non-empty array' });
        return;
      }

      if (pdsIds.length > 50) {
        res.status(400).json({ error: 'Batch size limit exceeded. Maximum 50 PDS records per batch.' });
        return;
      }

      const results = [];
      let validCount = 0;
      let invalidCount = 0;

      for (const pdsId of pdsIds) {
        try {
          const pds = await this.pdsRepository.findById(pdsId);
          
          if (!pds || pds.user_id !== userId) {
            results.push({
              pdsId,
              isValid: false,
              errors: ['PDS record not found or access denied'],
              processedAt: new Date().toISOString()
            });
            invalidCount++;
            continue;
          }

          const validationResult = await this.validationService.validatePDS(pds.full_data);
          const isValid = validationResult.isValid;
          
          results.push({
            pdsId,
            isValid,
            errors: validationResult.errors,
            processedAt: new Date().toISOString()
          });

          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }
        } catch (error) {
          logger.error(`Batch validation error for PDS ${pdsId}:`, error);
          results.push({
            pdsId,
            isValid: false,
            errors: ['Validation failed due to system error'],
            processedAt: new Date().toISOString()
          });
          invalidCount++;
        }
      }

      res.json({
        totalProcessed: pdsIds.length,
        validCount,
        invalidCount,
        results
      });

      logger.info(`Batch PDS validation completed: ${pdsIds.length} records processed by user: ${userId}`);
    } catch (error) {
      logger.error('Batch validate PDS records error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async restore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const existingPds = await this.pdsRepository.findDeletedById(id);
      
      if (!existingPds) {
        res.status(404).json({ error: 'Deleted PDS record not found' });
        return;
      }

      if (existingPds.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      const restoredPds = await this.pdsRepository.restore(id);
      
      // Log the restore action
      await auditService.logAction({
        userId,
        action: 'restore',
        entityType: 'pds',
        entityId: id,
        details: {
          title: restoredPds.title,
          description: restoredPds.description
        }
      });

      res.json({
        message: 'PDS record restored successfully',
        data: restoredPds
      });

      logger.info(`PDS record restored: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Restore PDS record error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}