import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

export interface UserData {
  email: string;
  password: string;
  password_hash?: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class UserFactory {
  /**
   * Generate a random user with valid data
   */
  static async create(overrides: Partial<UserData> = {}): Promise<UserData> {
    const password = overrides.password || faker.internet.password({ length: 12 });
    const password_hash = await bcrypt.hash(password, 10);

    return {
      email: faker.internet.email().toLowerCase(),
      password,
      password_hash,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role: 'user',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate multiple users
   */
  static async createMany(count: number, overrides: Partial<UserData> = {}): Promise<UserData[]> {
    const users: UserData[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.create(overrides));
    }
    return users;
  }

  /**
   * Generate an admin user
   */
  static async createAdmin(overrides: Partial<UserData> = {}): Promise<UserData> {
    return this.create({
      role: 'admin',
      email: `admin-${faker.string.uuid()}@pds-maker.com`,
      ...overrides,
    });
  }

  /**
   * Generate a deactivated user
   */
  static async createDeactivated(overrides: Partial<UserData> = {}): Promise<UserData> {
    return this.create({
      is_active: false,
      ...overrides,
    });
  }

  /**
   * Generate user registration data (without password_hash)
   */
  static createRegistrationData(overrides: Partial<UserData> = {}): Omit<UserData, 'password_hash' | 'created_at' | 'updated_at' | 'role' | 'is_active'> {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      ...overrides,
    };
  }

  /**
   * Generate login credentials
   */
  static createLoginCredentials(overrides: Partial<{ email: string; password: string }> = {}): { email: string; password: string } {
    return {
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };
  }
}