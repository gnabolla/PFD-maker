import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../index';
import { UserRepository } from '../repositories/UserRepository';

// Mock the database
jest.mock('../repositories/UserRepository');
const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

describe('Auth Endpoints', () => {
  let userRepositoryInstance: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepositoryInstance = new mockUserRepository() as jest.Mocked<UserRepository>;
    (UserRepository as any).mockImplementation(() => userRepositoryInstance);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockUser = {
        id: '123',
        email: userData.email,
        password_hash: 'hashed_password',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      userRepositoryInstance.findByEmail.mockResolvedValue(null);
      userRepositoryInstance.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const existingUser = {
        id: '123',
        email: userData.email,
        password_hash: 'hashed_password',
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      userRepositoryInstance.findByEmail.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      const mockUser = {
        id: '123',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      userRepositoryInstance.findByEmail.mockResolvedValue(mockUser);
      userRepositoryInstance.updateLastLogin.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      userRepositoryInstance.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return 401 for inactive user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      const mockUser = {
        id: '123',
        email: loginData.email,
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      userRepositoryInstance.findByEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Account is deactivated');
    });
  });
});