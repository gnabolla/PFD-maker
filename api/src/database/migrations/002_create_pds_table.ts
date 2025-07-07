import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('status').defaultTo('draft'); // draft, validated, submitted, approved
    table.string('title').notNullable();
    table.text('description').nullable();
    
    // Personal Information
    table.string('surname').notNullable();
    table.string('first_name').notNullable();
    table.string('name_extension').nullable();
    table.string('middle_name').notNullable();
    table.string('date_of_birth').notNullable(); // mm/dd/yyyy
    table.string('place_of_birth').notNullable();
    table.string('civil_status').notNullable();
    table.string('civil_status_details').nullable();
    table.string('height').notNullable();
    table.string('weight').notNullable();
    table.string('blood_type').notNullable();
    table.string('gsis_id').nullable();
    table.string('pagibig_id').nullable();
    table.string('philhealth_id').nullable();
    table.string('sss_id').nullable();
    table.string('tin_id').nullable();
    table.string('agency_employee_id').nullable();
    table.string('citizenship').notNullable();
    table.string('dual_citizenship').nullable();
    table.string('telephone_number').nullable();
    table.string('mobile_number').nullable();
    table.string('email_address').nullable();
    
    // Residential Address
    table.string('res_house_block_lot_number').notNullable();
    table.string('res_street').notNullable();
    table.string('res_subdivision_village').notNullable();
    table.string('res_barangay').notNullable();
    table.string('res_city_municipality').notNullable();
    table.string('res_province').notNullable();
    table.string('res_zip_code').notNullable();
    
    // Permanent Address
    table.string('perm_house_block_lot_number').notNullable();
    table.string('perm_street').notNullable();
    table.string('perm_subdivision_village').notNullable();
    table.string('perm_barangay').notNullable();
    table.string('perm_city_municipality').notNullable();
    table.string('perm_province').notNullable();
    table.string('perm_zip_code').notNullable();
    
    // Father Information
    table.string('father_surname').notNullable();
    table.string('father_first_name').notNullable();
    table.string('father_name_extension').nullable();
    table.string('father_middle_name').notNullable();
    
    // Mother Information
    table.string('mother_maiden_name').notNullable();
    table.string('mother_surname').notNullable();
    table.string('mother_first_name').notNullable();
    table.string('mother_middle_name').notNullable();
    
    // Signature and authentication
    table.text('signature').nullable(); // Base64 encoded
    table.text('right_thumb_mark').nullable(); // Base64 encoded
    table.string('government_id_number').nullable();
    table.string('government_id_issuance_date').nullable(); // mm/dd/yyyy
    table.string('date_accomplished').nullable(); // mm/dd/yyyy
    table.text('passport_size_photo').nullable(); // Base64 encoded
    
    // Full PDS data as JSON for complex structures
    table.json('full_data').nullable();
    
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['status']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds');
}