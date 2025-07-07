import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable();
    table.enum('action', ['create', 'update', 'delete', 'restore', 'export', 'import', 'validate']).notNullable();
    table.enum('entity_type', ['pds', 'template', 'user']).notNullable();
    table.string('entity_id').notNullable();
    table.jsonb('changes').nullable(); // Stores before/after changes
    table.jsonb('details').nullable(); // Additional context
    table.string('ip_address', 45).nullable(); // Supports IPv4 and IPv6
    table.text('user_agent').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Indexes for performance
    table.index('user_id');
    table.index('entity_type');
    table.index('entity_id');
    table.index(['entity_type', 'entity_id']);
    table.index('action');
    table.index('created_at');

    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('audit_logs');
}