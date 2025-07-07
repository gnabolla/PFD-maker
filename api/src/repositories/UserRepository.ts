import { Knex } from 'knex';
import { db } from '@/database/connection';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  email_verified_at?: Date;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export class UserRepository {
  private db: Knex;

  constructor(database: Knex = db) {
    this.db = database;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db('users').where({ id }).first();
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db('users').where({ email }).first();
    return user || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const [user] = await this.db('users').insert(userData).returning('*');
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const [user] = await this.db('users')
      .where({ id })
      .update({ ...userData, updated_at: new Date() })
      .returning('*');
    return user || null;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db('users').where({ id }).del();
    return deletedCount > 0;
  }

  async findAll(filters: { is_active?: boolean } = {}): Promise<User[]> {
    let query = this.db('users').select('*');
    
    if (filters.is_active !== undefined) {
      query = query.where({ is_active: filters.is_active });
    }
    
    return query;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db('users')
      .where({ id })
      .update({ last_login_at: new Date() });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.db('users')
      .where({ id })
      .update({ email_verified_at: new Date() });
  }
}