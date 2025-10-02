import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'gestion_documental',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    'src/domains/**/entities/*.ts'
  ],
  migrations: [
    'src/shared/infrastructure/database/migrations/*.ts'
  ],
  subscribers: [
    'src/shared/infrastructure/database/subscribers/*.ts'
  ],
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection initialized successfully');
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};