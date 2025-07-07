import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Insert admin user
  await knex('users').insert([
    {
      email: 'admin@pds-maker.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true,
      email_verified_at: new Date().toISOString()
    }
  ]);
}