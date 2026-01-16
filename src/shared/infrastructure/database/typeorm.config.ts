import { DataSource, DataSourceOptions } from 'typeorm';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions.js';
import { BetterSqlite3ConnectionOptions } from 'typeorm/driver/better-sqlite3/BetterSqlite3ConnectionOptions.js';

type Mode = 'development' | 'production' | 'test';
type DbType = 'mysql' | 'postgres' | 'sqlite' | 'better-sqlite3';

export const AppDataSource = initializeDataSource();

export function initializeDataSource(): DataSource {
  const mode = (process.env.NODE_ENV || 'production') as Mode;
  let options: DataSourceOptions;

  if (process.env.DB_TYPE === 'sqljs') {
    options = {
      type: 'sqljs',
      location: ':memory:', // use in-memory database
      autoSave: false, // disable auto-save
      synchronize: true,
    } satisfies SqljsConnectionOptions;
  } else if (process.env.DB_TYPE === 'sqlite' || process.env.DB_TYPE === 'better-sqlite3') {
    options = {
      type: 'better-sqlite3',
      database: process.env.DB_DATABASE || 'mydb.sqlite',
    } satisfies BetterSqlite3ConnectionOptions;
  } else {
    options = {
      type: (process.env.DB_TYPE || 'mysql') as DbType,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'gestion_documental',
      charset: 'utf8mb4',
      timezone: 'local',
    } satisfies DataSourceOptions;
  }
  return new DataSource({
    ...options,
    logging: options.logging ?? (mode !== 'production' && process.env.SHOW_DB_QUERY === 'true'),
    synchronize: options.synchronize ?? (mode !== 'production' && process.env.DB_SYNCHRONIZE !== 'false'),
    entities: [
      'src/shared/infrastructure/database/entities/**/*.ts',
      'src/domains/**/*.entity.ts',
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
      if (process.env.NODE_ENV !== 'test') {
        console.log('✅ Database connection initialized successfully');
        console.log('✅ Database type:', DataSource.options.type);
      }
    } else {
      // Already initialized (tests may initialize DB multiple times)
      if (process.env.NODE_ENV !== 'test') {
        console.log('⚠️ Database connection already initialized');
      }
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
}

export async function clearDatabase(DataSource?: DataSource): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  if (!DataSource) {
    DataSource = AppDataSource;
  }
  if (DataSource.isInitialized) {
    await DataSource.dropDatabase();
    await DataSource.synchronize();
  }
}
