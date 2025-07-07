import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds_civil_service', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('pds_id').references('id').inTable('pds').onDelete('CASCADE');
    table.string('career_service').notNullable();
    table.string('rating').notNullable();
    table.string('date_of_examination_conferment').notNullable(); // mm/dd/yyyy
    table.string('place_of_examination_conferment').notNullable();
    table.string('license_number').nullable();
    table.string('license_validity_date').nullable(); // mm/dd/yyyy
    table.integer('order_index').notNullable();
    table.timestamps(true, true);
    
    table.index(['pds_id']);
    table.index(['order_index']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds_civil_service');
}