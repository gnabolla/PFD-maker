import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable(); // Null for system-wide default templates
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.boolean('is_default').defaultTo(false);
    table.boolean('is_system').defaultTo(false); // System templates can't be edited/deleted
    table.jsonb('template_data').notNullable(); // The actual PDS template data
    table.integer('usage_count').defaultTo(0);
    table.timestamp('last_used_at').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index('user_id');
    table.index('is_default');
    table.index('is_system');
    table.index(['user_id', 'name']); // Unique name per user

    // Foreign key
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');

    // Unique constraint
    table.unique(['user_id', 'name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds_templates');
}