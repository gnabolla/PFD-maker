import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('role').defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at').nullable();
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['is_active']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}