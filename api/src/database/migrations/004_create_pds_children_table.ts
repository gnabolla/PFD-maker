import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds_children', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('pds_id').references('id').inTable('pds').onDelete('CASCADE');
    table.string('full_name').notNullable();
    table.string('date_of_birth').notNullable(); // mm/dd/yyyy
    table.integer('order_index').notNullable();
    table.timestamps(true, true);
    
    table.index(['pds_id']);
    table.index(['order_index']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds_children');
}