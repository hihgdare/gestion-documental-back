import { DataSource, DataSourceOptions } from 'typeorm';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions.js';

type Mode = 'development' | 'production' | 'test';

export const AppDataSource = initializeDataSource();

export function initializeDataSource(): DataSource {
  const mode = process.env.NODE_ENV as Mode;
  let options: DataSourceOptions;

  if (mode === 'test') {
    options = {
      type: 'sqljs', //use sqljs for testing
      location: ':memory:', // use in-memory database for tests
      autoSave: false, // disable auto-save for in-memory testing
      synchronize: true,
      logging: false,
    } satisfies SqljsConnectionOptions;
  } else {
    options = {
      type: (process.env.DB_TYPE || 'mysql') as 'mysql' | 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'gestion_documental',
      synchronize: mode === 'development',
      logging: mode === 'development',
      charset: 'utf8mb4',
      timezone: 'Z',
    } satisfies DataSourceOptions;
  }
  return new DataSource({
    ...options,
    entities: [
      'src/shared/infrastructure/database/entities/**/*.ts',
      'src/application/entities/**/*.ts',
    ],
    migrations: [
      'src/shared/infrastructure/database/migrations/*.ts',
    ],
    subscribers: [
      'src/shared/infrastructure/database/subscribers/*.ts',
    ],
  });
}

export async function initializeDatabase(DataSource?: DataSource): Promise<void> {
  if (!DataSource) {
    DataSource = AppDataSource;
  }
  try {
    if (!DataSource.isInitialized) {
      await DataSource.initialize();
      console.log('✅ Database connection initialized successfully');
      console.log('✅ Database type:', DataSource.options.type);
    } else {
      // Already initialized (tests may initialize DB multiple times)
      console.log('⚠️ Database connection already initialized');
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};

export async function clearDatabase(DataSource?: DataSource): Promise<void> {
  if (!DataSource) {
    DataSource = AppDataSource;
  }
  if (DataSource.isInitialized) {
    await DataSource.dropDatabase();
    await DataSource.synchronize();
  }
}
