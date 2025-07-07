import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('pds', (table) => {
    table.timestamp('deleted_at').nullable();
    table.index('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('pds', (table) => {
    table.dropColumn('deleted_at');
  });
}