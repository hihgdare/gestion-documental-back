require('reflect-metadata');
require('ts-node/register');
const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_ROOT_USERNAME || process.env.DB_USERNAME || 'root',
  password: process.env.DB_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'gestion_documental',
  synchronize: false, // Always false for migrations
  logging: process.env.NODE_ENV === 'development',
  entities: [
    'src/shared/infrastructure/database/entities/*.ts'
  ],
  migrations: [
    'src/shared/infrastructure/database/migrations/*.ts'
  ],
  subscribers: [
    'src/shared/infrastructure/database/subscribers/*.ts'
  ],
  charset: 'utf8mb4',
  timezone: 'Z',
});

module.exports = AppDataSource;
