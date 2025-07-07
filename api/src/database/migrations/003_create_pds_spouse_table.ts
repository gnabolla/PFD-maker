import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds_spouse', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('pds_id').references('id').inTable('pds').onDelete('CASCADE');
    table.string('surname').notNullable();
    table.string('first_name').notNullable();
    table.string('name_extension').nullable();
    table.string('middle_name').notNullable();
    table.string('occupation').notNullable();
    table.string('employer_business_name').notNullable();
    table.string('business_address').notNullable();
    table.string('telephone_number').nullable();
    table.timestamps(true, true);
    
    table.index(['pds_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds_spouse');
}