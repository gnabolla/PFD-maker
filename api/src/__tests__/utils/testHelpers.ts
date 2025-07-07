import jwt from 'jsonwebtoken';
import { UserFactory } from '../factories/userFactory';
import { PDSFactory } from '../factories/pdsFactory';

export class TestHelpers {
  /**
   * Generate a valid JWT token for testing
   */
  static generateToken(payload: any = {}, expiresIn: string = '24h'): string {
    const defaultPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
      ...payload,
    };

    return jwt.sign(
      defaultPayload,
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn }
    );
  }

  /**
   * Generate an expired JWT token
   */
  static generateExpiredToken(payload: any = {}): string {
    return this.generateToken(payload, '-1h');
  }

  /**
   * Generate authorization header with token
   */
  static getAuthHeader(token?: string): { Authorization: string } {
    const jwtToken = token || this.generateToken();
    return { Authorization: `Bearer ${jwtToken}` };
  }

  /**
   * Create test user and get auth token
   */
  static async createAuthenticatedUser(overrides: any = {}) {
    const user = await UserFactory.create(overrides);
    const token = this.generateToken({
      userId: user.email, // Using email as ID for simplicity in tests
      email: user.email,
      role: user.role,
    });

    return { user, token, authHeader: this.getAuthHeader(token) };
  }

  /**
   * Create a complete test scenario with user and PDS
   */
  static async createCompleteTestScenario() {
    const { user, token, authHeader } = await this.createAuthenticatedUser();
    const pdsData = PDSFactory.createValid();
    
    return {
      user,
      token,
      authHeader,
      pdsData,
      invalidPdsData: PDSFactory.createWithMissingFields(),
      pdsWithBadDates: PDSFactory.createWithInvalidDates(),
      pdsWithAbbreviations: PDSFactory.createWithAbbreviations(),
    };
  }

  /**
   * Mock successful API responses
   */
  static mockSuccessResponse(data: any = {}, message: string = 'Success') {
    return {
      success: true,
      message,
      ...data,
    };
  }

  /**
   * Mock error API responses
   */
  static mockErrorResponse(error: string, statusCode: number = 400, details: any = null) {
    const response: any = {
      success: false,
      error,
    };

    if (details) {
      response.details = details;
    }

    return response;
  }

  /**
   * Generate validation error details
   */
  static generateValidationErrors(errors: Array<{ field: string; message: string }>) {
    return errors.map(error => ({
      field: error.field,
      message: error.message,
      code: 'VALIDATION_ERROR',
      severity: 'error',
    }));
  }

  /**
   * Wait for async operations
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up test data (for integration tests)
   */
  static async cleanupTestData(knex: any, userId: string) {
    await knex('pds').where('user_id', userId).del();
    await knex('users').where('id', userId).del();
  }

  /**
   * Seed test database with sample data
   */
  static async seedTestDatabase(knex: any) {
    // Create test users
    const users = await UserFactory.createMany(5);
    const admin = await UserFactory.createAdmin();
    
    // Insert users
    const insertedUsers = await knex('users').insert([...users, admin]).returning('*');
    
    // Create PDS for each user
    for (const user of insertedUsers) {
      const pdsData = PDSFactory.createValid();
      await knex('pds').insert({
        user_id: user.id,
        status: 'draft',
        full_data: JSON.stringify(pdsData),
      });
    }

    return { users: insertedUsers, adminId: admin.email };
  }

  /**
   * Assert validation error structure
   */
  static assertValidationError(error: any) {
    expect(error).toHaveProperty('field');
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('severity');
  }

  /**
   * Assert PDS structure
   */
  static assertPDSStructure(pds: any) {
    expect(pds).toHaveProperty('id');
    expect(pds).toHaveProperty('user_id');
    expect(pds).toHaveProperty('status');
    expect(pds).toHaveProperty('full_data');
    expect(pds).toHaveProperty('created_at');
    expect(pds).toHaveProperty('updated_at');
  }

  /**
   * Assert user structure (without password)
   */
  static assertUserStructure(user: any) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('first_name');
    expect(user).toHaveProperty('last_name');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('is_active');
    expect(user).not.toHaveProperty('password_hash');
    expect(user).not.toHaveProperty('password');
  }
}