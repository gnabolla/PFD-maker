import request from 'supertest';
import app from '../index';
import { PDSRepository } from '../repositories/PDSRepository';
import { UserRepository } from '../repositories/UserRepository';
import jwt from 'jsonwebtoken';
import { PDSData } from '@/models/pds';

// Mock repositories
jest.mock('../repositories/PDSRepository');
jest.mock('../repositories/UserRepository');

const mockPDSRepository = PDSRepository as jest.MockedClass<typeof PDSRepository>;
const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('PDS Endpoints', () => {
  let pdsRepositoryInstance: jest.Mocked<PDSRepository>;
  let userRepositoryInstance: jest.Mocked<UserRepository>;
  let authToken: string;
  const userId = 'test-user-id';

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
  });

  describe('GET /api/pds', () => {
    it('should get all PDS for authenticated user', async () => {
      const mockPDSList = [
        {
          id: 'pds-1',
          user_id: userId,
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date(),
          full_data: {},
        },
        {
          id: 'pds-2',
          user_id: userId,
          status: 'completed',
          created_at: new Date(),
          updated_at: new Date(),
          full_data: {},
        },
      ];

      pdsRepositoryInstance.findByUserId.mockResolvedValue(mockPDSList);

      const response = await request(app)
        .get('/api/pds')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pdsList).toHaveLength(2);
      expect(pdsRepositoryInstance.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/pds');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('POST /api/pds', () => {
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

    it('should create new PDS for authenticated user', async () => {
      const mockCreatedPDS = {
        id: 'new-pds-id',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      pdsRepositoryInstance.create.mockResolvedValue(mockCreatedPDS);

      const response = await request(app)
        .post('/api/pds')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pdsData: validPDSData });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('PDS created successfully');
      expect(response.body.pds).toBeDefined();
      expect(pdsRepositoryInstance.create).toHaveBeenCalledWith(
        userId,
        validPDSData,
        'draft'
      );
    });

    it('should validate PDS data before creation', async () => {
      const invalidPDSData = {
        personalInformation: {
          // Missing required fields
          surname: '',
          firstName: '',
        },
      };

      const response = await request(app)
        .post('/api/pds')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pdsData: invalidPDSData });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/pds/:id', () => {
    it('should get specific PDS by id', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .get('/api/pds/pds-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pds.id).toBe('pds-1');
      expect(pdsRepositoryInstance.findById).toHaveBeenCalledWith('pds-1');
    });

    it('should return 404 for non-existent PDS', async () => {
      pdsRepositoryInstance.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/pds/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('PDS not found');
    });

    it('should return 403 for PDS owned by another user', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: 'another-user-id',
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: {},
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .get('/api/pds/pds-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('PUT /api/pds/:id', () => {
    it('should update existing PDS', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      const updatedData = {
        ...validPDSData,
        personalInformation: {
          ...validPDSData.personalInformation,
          emailAddress: 'newemail@example.com',
        },
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      pdsRepositoryInstance.update.mockResolvedValue({
        ...mockPDS,
        full_data: updatedData,
        updated_at: new Date(),
      });

      const response = await request(app)
        .put('/api/pds/pds-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pdsData: updatedData, status: 'draft' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('PDS updated successfully');
      expect(pdsRepositoryInstance.update).toHaveBeenCalledWith(
        'pds-1',
        updatedData,
        'draft'
      );
    });

    it('should validate PDS data before updating', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      const invalidData = {
        personalInformation: {
          dateOfBirth: 'invalid-date',
        },
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .put('/api/pds/pds-1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pdsData: invalidData });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/pds/:id', () => {
    it('should delete PDS owned by user', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: {},
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);
      pdsRepositoryInstance.delete.mockResolvedValue();

      const response = await request(app)
        .delete('/api/pds/pds-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('PDS deleted successfully');
      expect(pdsRepositoryInstance.delete).toHaveBeenCalledWith('pds-1');
    });

    it('should return 403 when trying to delete PDS owned by another user', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: 'another-user-id',
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: {},
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .delete('/api/pds/pds-1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
      expect(pdsRepositoryInstance.delete).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/pds/:id/validate', () => {
    it('should validate PDS and return validation results', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: {
          ...validPDSData,
          personalInformation: {
            ...validPDSData.personalInformation,
            dateOfBirth: '1990-01-15', // Invalid format
          },
        },
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .post('/api/pds/pds-1/validate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(response.body.errors[0].code).toBe('INVALID_DATE_FORMAT');
    });

    it('should return valid result for correct PDS data', async () => {
      const mockPDS = {
        id: 'pds-1',
        user_id: userId,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
        full_data: validPDSData,
      };

      pdsRepositoryInstance.findById.mockResolvedValue(mockPDS);

      const response = await request(app)
        .post('/api/pds/pds-1/validate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isValid).toBe(true);
      expect(response.body.errors).toEqual([]);
    });
  });
});