import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds_work_experience', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('pds_id').references('id').inTable('pds').onDelete('CASCADE');
    table.string('date_from').notNullable(); // mm/dd/yyyy
    table.string('date_to').notNullable(); // mm/dd/yyyy or "Present"
    table.string('position_title').notNullable();
    table.string('department_agency_office_company').notNullable();
    table.decimal('monthly_salary', 10, 2).notNullable();
    table.string('salary_grade').nullable();
    table.string('status_of_appointment').notNullable();
    table.boolean('government_service').notNullable();
    table.integer('order_index').notNullable();
    table.timestamps(true, true);
    
    table.index(['pds_id']);
    table.index(['government_service']);
    table.index(['order_index']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds_work_experience');
}