import { Knex } from 'knex';
import { db } from '@/database/connection';

export interface PDSTemplate {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  is_default: boolean;
  is_system: boolean;
  template_data: any;
  usage_count: number;
  last_used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTemplateData {
  user_id: string | null;
  name: string;
  description?: string;
  is_default?: boolean;
  is_system?: boolean;
  template_data: any;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  is_default?: boolean;
  template_data?: any;
}

export class TemplateRepository {
  private db: Knex;

  constructor(database: Knex = db) {
    this.db = database;
  }

  async findById(id: string): Promise<PDSTemplate | null> {
    const template = await this.db('pds_templates').where({ id }).first();
    return template || null;
  }

  async findByUserId(userId: string, includeDefaults: boolean = false): Promise<PDSTemplate[]> {
    let query = this.db('pds_templates').select('*');
    
    if (includeDefaults) {
      // Include user templates and system templates
      query = query.where((builder) => {
        builder.where({ user_id: userId }).orWhere({ is_system: true });
      });
    } else {
      // Only user templates
      query = query.where({ user_id: userId });
    }
    
    return query.orderBy('name', 'asc');
  }

  async findSystemTemplates(): Promise<PDSTemplate[]> {
    return this.db('pds_templates')
      .where({ is_system: true })
      .orderBy('name', 'asc');
  }

  async create(templateData: CreateTemplateData): Promise<PDSTemplate> {
    const [template] = await this.db('pds_templates')
      .insert({
        ...templateData,
        usage_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return template;
  }

  async update(id: string, updateData: UpdateTemplateData): Promise<PDSTemplate | null> {
    const [template] = await this.db('pds_templates')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');
    return template || null;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db('pds_templates')
      .where({ id })
      .del();
    return deletedCount > 0;
  }

  async incrementUsage(id: string): Promise<void> {
    await this.db('pds_templates')
      .where({ id })
      .increment('usage_count', 1)
      .update({
        last_used_at: new Date()
      });
  }

  async findByName(userId: string, name: string): Promise<PDSTemplate | null> {
    const template = await this.db('pds_templates')
      .where({ user_id: userId, name })
      .first();
    return template || null;
  }

  async getMostUsedTemplates(userId: string, limit: number = 5): Promise<PDSTemplate[]> {
    return this.db('pds_templates')
      .where((builder) => {
        builder.where({ user_id: userId }).orWhere({ is_system: true });
      })
      .orderBy('usage_count', 'desc')
      .limit(limit);
  }

  async getRecentlyUsedTemplates(userId: string, limit: number = 5): Promise<PDSTemplate[]> {
    return this.db('pds_templates')
      .where((builder) => {
        builder.where({ user_id: userId }).orWhere({ is_system: true });
      })
      .whereNotNull('last_used_at')
      .orderBy('last_used_at', 'desc')
      .limit(limit);
  }
}