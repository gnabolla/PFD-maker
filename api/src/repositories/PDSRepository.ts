import { Knex } from 'knex';
import { db } from '@/database/connection';
import { PDSData } from '@/models/pds';

export interface PDSRecord {
  id: string;
  user_id: string;
  status: string;
  title: string;
  description?: string;
  surname: string;
  first_name: string;
  name_extension?: string;
  middle_name: string;
  date_of_birth: string;
  place_of_birth: string;
  civil_status: string;
  civil_status_details?: string;
  height: string;
  weight: string;
  blood_type: string;
  gsis_id?: string;
  pagibig_id?: string;
  philhealth_id?: string;
  sss_id?: string;
  tin_id?: string;
  agency_employee_id?: string;
  citizenship: string;
  dual_citizenship?: string;
  telephone_number?: string;
  mobile_number?: string;
  email_address?: string;
  res_house_block_lot_number: string;
  res_street: string;
  res_subdivision_village: string;
  res_barangay: string;
  res_city_municipality: string;
  res_province: string;
  res_zip_code: string;
  perm_house_block_lot_number: string;
  perm_street: string;
  perm_subdivision_village: string;
  perm_barangay: string;
  perm_city_municipality: string;
  perm_province: string;
  perm_zip_code: string;
  father_surname: string;
  father_first_name: string;
  father_name_extension?: string;
  father_middle_name: string;
  mother_maiden_name: string;
  mother_surname: string;
  mother_first_name: string;
  mother_middle_name: string;
  signature?: string;
  right_thumb_mark?: string;
  government_id_number?: string;
  government_id_issuance_date?: string;
  date_accomplished?: string;
  passport_size_photo?: string;
  full_data?: any;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CreatePDSData {
  user_id: string;
  title: string;
  description?: string;
  surname: string;
  first_name: string;
  name_extension?: string;
  middle_name: string;
  date_of_birth: string;
  place_of_birth: string;
  civil_status: string;
  civil_status_details?: string;
  height: string;
  weight: string;
  blood_type: string;
  gsis_id?: string;
  pagibig_id?: string;
  philhealth_id?: string;
  sss_id?: string;
  tin_id?: string;
  agency_employee_id?: string;
  citizenship: string;
  dual_citizenship?: string;
  telephone_number?: string;
  mobile_number?: string;
  email_address?: string;
  res_house_block_lot_number: string;
  res_street: string;
  res_subdivision_village: string;
  res_barangay: string;
  res_city_municipality: string;
  res_province: string;
  res_zip_code: string;
  perm_house_block_lot_number: string;
  perm_street: string;
  perm_subdivision_village: string;
  perm_barangay: string;
  perm_city_municipality: string;
  perm_province: string;
  perm_zip_code: string;
  father_surname: string;
  father_first_name: string;
  father_name_extension?: string;
  father_middle_name: string;
  mother_maiden_name: string;
  mother_surname: string;
  mother_first_name: string;
  mother_middle_name: string;
  signature?: string;
  right_thumb_mark?: string;
  government_id_number?: string;
  government_id_issuance_date?: string;
  date_accomplished?: string;
  passport_size_photo?: string;
  full_data?: PDSData;
}

export class PDSRepository {
  private db: Knex;

  constructor(database: Knex = db) {
    this.db = database;
  }

  async findById(id: string): Promise<PDSRecord | null> {
    const pds = await this.db('pds').where({ id }).whereNull('deleted_at').first();
    return pds || null;
  }

  async findDeletedById(id: string): Promise<PDSRecord | null> {
    const pds = await this.db('pds').where({ id }).whereNotNull('deleted_at').first();
    return pds || null;
  }

  async findByUserId(userId: string): Promise<PDSRecord[]> {
    return this.db('pds').where({ user_id: userId }).whereNull('deleted_at').orderBy('created_at', 'desc');
  }

  async create(pdsData: CreatePDSData): Promise<PDSRecord> {
    const [pds] = await this.db('pds').insert(pdsData).returning('*');
    return pds;
  }

  async update(id: string, pdsData: Partial<PDSRecord>): Promise<PDSRecord | null> {
    const [pds] = await this.db('pds')
      .where({ id })
      .update({ ...pdsData, updated_at: new Date() })
      .returning('*');
    return pds || null;
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete - just set deleted_at timestamp
    const [pds] = await this.db('pds')
      .where({ id })
      .whereNull('deleted_at')
      .update({ deleted_at: new Date(), updated_at: new Date() })
      .returning('*');
    return !!pds;
  }

  async hardDelete(id: string): Promise<boolean> {
    // Permanent delete - remove from database
    const deletedCount = await this.db('pds').where({ id }).del();
    return deletedCount > 0;
  }

  async restore(id: string): Promise<PDSRecord | null> {
    const [pds] = await this.db('pds')
      .where({ id })
      .whereNotNull('deleted_at')
      .update({ deleted_at: null, updated_at: new Date() })
      .returning('*');
    return pds || null;
  }

  async findAll(filters: { 
    user_id?: string; 
    status?: string; 
    limit?: number; 
    offset?: number;
    includeDeleted?: boolean;
  } = {}): Promise<PDSRecord[]> {
    let query = this.db('pds').select('*');
    
    if (filters.user_id) {
      query = query.where({ user_id: filters.user_id });
    }
    
    if (filters.status) {
      query = query.where({ status: filters.status });
    }
    
    // By default, exclude soft-deleted records
    if (!filters.includeDeleted) {
      query = query.whereNull('deleted_at');
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    return query.orderBy('created_at', 'desc');
  }

  async updateStatus(id: string, status: string): Promise<PDSRecord | null> {
    const [pds] = await this.db('pds')
      .where({ id })
      .update({ status, updated_at: new Date() })
      .returning('*');
    return pds || null;
  }

  async count(filters: { user_id?: string; status?: string; includeDeleted?: boolean } = {}): Promise<number> {
    let query = this.db('pds').count('* as count');
    
    if (filters.user_id) {
      query = query.where({ user_id: filters.user_id });
    }
    
    if (filters.status) {
      query = query.where({ status: filters.status });
    }
    
    // By default, exclude soft-deleted records
    if (!filters.includeDeleted) {
      query = query.whereNull('deleted_at');
    }
    
    const result = await query.first();
    return parseInt(result?.count as string) || 0;
  }
}