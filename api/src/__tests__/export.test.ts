import request from 'supertest';
import app from '../index';
import { PDSRepository } from '../repositories/PDSRepository';
import { UserRepository } from '../repositories/UserRepository';
import { FileExportService } from '../services/fileExport';
import jwt from 'jsonwebtoken';
import { PDSData } from '@/models/pds';

// Mock repositories and services
jest.mock('../repositories/PDSRepository');
jest.mock('../repositories/UserRepository');
jest.mock('../services/fileExport');

const mockPDSRepository = PDSRepository as jest.MockedClass<typeof PDSRepository>;
const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;
const mockFileExportService = FileExportService as jest.MockedClass<typeof FileExportService>;

describe('Export Endpoints', () => {
  let pdsRepositoryInstance: jest.Mocked<PDSRepository>;
  let userRepositoryInstance: jest.Mocked<UserRepository>;
  let authToken: string;
  const userId = 'test-user-id';

  const validPDSData: Partial<PDSData> = {
    personalInformation: {
      surname: 'DELA CRUZ',
      firstName: 'JUAN',
      middleName: 'SANTOS',
      nameExtension: '',
      dateOfBirth: '01/15/1990',
      placeOfBirth: 'Manila',
      sex: 'Male',
      civilStatus: 'Single',
      citizenship: 'Filipino',
      height: 175,
      weight: 70,
      bloodType: 'O+',
      gsisIdNumber: '1234567890',
      pagIbigIdNumber: '1234567890',
      philHealthNumber: '12-345678901-2',
      sssNumber: '12-3456789-0',
      tinNumber: '123-456-789',
      agencyEmployeeNumber: 'EMP001',
      residentialAddress: {
        houseBlockLotNumber: '123',
        street: 'Main St',
        subdivision: 'Subdivision',
        barangay: 'Barangay 1',
        cityMunicipality: 'Manila',
        province: 'Metro Manila',
        zipCode: '1000',
      },
      permanentAddress: {
        houseBlockLotNumber: '123',
        street: 'Main St',
        subdivision: 'Subdivision',
        barangay: 'Barangay 1',
        cityMunicipality: 'Manila',
        province: 'Metro Manila',
        zipCode: '1000',
      },
      telephoneNumber: '02-1234567',
      mobileNumber: '09171234567',
      emailAddress: 'juan@example.com',
    },
  };

  beforeEach(() => {
    pdsRepositoryInstance = new mockPDSRepository() as jest.Mocked<PDSRepository>;
    userRepositoryInstance = new mockUserRepository() as jest.Mocked<UserRepository>;
    (PDSRepository as any).mockImplementation(() => pdsRepositoryInstance);
    (UserRepository as any).mockImplementation(() => userRepositoryInstance);

    // Create auth token for protected routes
    authToken = jwt.sign(
      { userId, email: 'test@example.com', role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    // Mock user verification
    userRepositoryInstance.findById.mockResolvedValue({
      id: userId,
      email: 'test@example.com',
      password_hash: 'hash',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('GET /api/export/pds/:id/excel', () => {
    it('should export PDS to Excel format', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      const mockBuffer = Buffer.from('mock excel content');

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToExcel.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/export/pds/pds-1/excel')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="PDS_DELA_CRUZ_JUAN_\d+\.xlsx"/);
      expect(mockFileExportService.exportToExcel).toHaveBeenCalledWith(validPDSData);
    });

    it('should return 404 for non-existent PDS', async () => {
      pdsRepositoryInstance.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/export/pds/non-existent/excel')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('PDS not found');
    });

    it('should return 403 for PDS owned by another user', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: 'another-user-id',
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .get('/api/export/pds/pds-1/excel')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });

    it('should handle export errors gracefully', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToExcel.mockRejectedValue(new Error('Export failed'));

      const response = await request(app)
        .get('/api/export/pds/pds-1/excel')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to export PDS to Excel');
    });
  });

  describe('GET /api/export/pds/:id/word', () => {
    it('should export PDS to Word format', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      const mockBuffer = Buffer.from('mock word content');

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToWord.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/export/pds/pds-1/word')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="PDS_DELA_CRUZ_JUAN_\d+\.docx"/);
      expect(mockFileExportService.exportToWord).toHaveBeenCalledWith(validPDSData);
    });
  });

  describe('GET /api/export/pds/:id/pdf', () => {
    it('should export PDS to PDF format', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      const mockBuffer = Buffer.from('mock pdf content');

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToPDF.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/export/pds/pds-1/pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="PDS_DELA_CRUZ_JUAN_\d+\.pdf"/);
      expect(mockFileExportService.exportToPDF).toHaveBeenCalledWith(validPDSData);
    });

    it('should handle missing required fields in PDS data', async () => {
      const incompletePDSData = {
        personalInformation: {
          surname: '',
          firstName: '',
        },
      };

      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: incompletePDSData,
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToPDF.mockRejectedValue(new Error('Invalid PDS data'));

      const response = await request(app)
        .get('/api/export/pds/pds-1/pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to export PDS to PDF');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all export endpoints', async () => {
      const endpoints = [
        '/api/export/pds/pds-1/excel',
        '/api/export/pds/pds-1/word',
        '/api/export/pds/pds-1/pdf',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('No token provided');
      }
    });

    it('should reject invalid tokens', async () => {
      const invalidToken = 'invalid.token.here';

      const response = await request(app)
        .get('/api/export/pds/pds-1/excel')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId, email: 'test@example.com', role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/export/pds/pds-1/excel')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('Export Format Variations', () => {
    it('should handle PDS with minimal data', async () => {
      const minimalPDSData = {
        personalInformation: {
          surname: 'TEST',
          firstName: 'USER',
          middleName: 'M',
        },
      };

      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: minimalPDSData,
      };

      const mockBuffer = Buffer.from('mock content');

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToExcel.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/export/pds/pds-1/excel')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toMatch(/attachment; filename="PDS_TEST_USER_\d+\.xlsx"/);
    });

    it('should sanitize filename for special characters', async () => {
      const pdsDataWithSpecialChars = {
        personalInformation: {
          surname: 'DE LA CRUZ/SANTOS',
          firstName: 'JUAN:JOSE',
          middleName: 'M',
        },
      };

      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: pdsDataWithSpecialChars,
      };

      const mockBuffer = Buffer.from('mock content');

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      mockFileExportService.exportToPDF.mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get('/api/export/pds/pds-1/pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Filename should have special characters removed or replaced
      expect(response.headers['content-disposition']).not.toContain('/');
      expect(response.headers['content-disposition']).not.toContain(':');
    });
  });
});