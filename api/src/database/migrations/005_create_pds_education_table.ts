import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pds_education', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('pds_id').references('id').inTable('pds').onDelete('CASCADE');
    table.string('level').notNullable(); // elementary, secondary, vocational, college, graduate
    table.string('name_of_school').notNullable();
    table.string('basic_education_degree_course').notNullable();
    table.string('period_from').notNullable(); // School year
    table.string('period_to').notNullable(); // School year
    table.string('highest_level_units_earned').nullable();
    table.string('year_graduated').nullable();
    table.string('scholarship_academic_honors_received').nullable();
    table.integer('order_index').notNullable();
    table.timestamps(true, true);
    
    table.index(['pds_id']);
    table.index(['level']);
    table.index(['order_index']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pds_education');
}