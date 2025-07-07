const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'pds_maker_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'database', 'migrations'),
      extension: 'ts',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds'),
      extension: 'ts'
    },
    pool: {
      min: 2,
      max: 10
    }
  },

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME_TEST || 'pds_maker_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'database', 'migrations'),
      extension: 'ts',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds'),
      extension: 'ts'
    },
    pool: {
      min: 1,
      max: 5
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'database', 'migrations'),
      extension: 'ts',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'database', 'seeds'),
      extension: 'ts'
    },
    pool: {
      min: 2,
      max: 20
    }
  }
};