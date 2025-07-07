import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.DB_NAME_TEST = 'pds_maker_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Global test setup
beforeAll(async () => {
  // Any global setup code
});

afterAll(async () => {
  // Any global cleanup code
});

beforeEach(() => {
  // Reset any mocks or state before each test
});

afterEach(() => {
  // Cleanup after each test
});