import { DataSource } from 'typeorm';

type Mode = 'development' | 'production' | 'test';
type DbType = 'mysql' | 'postgres' | 'sqlite' | 'better-sqlite3' | 'sqljs';

export const AppDataSource = initializeDataSource();

export function initializeDataSource(): DataSource {
  const mode = (process.env.NODE_ENV || 'production') as Mode;
  const type = process.env.DB_TYPE as DbType;
  const options = {
    logging: mode !== 'production' && process.env.SHOW_DB_QUERY === 'true',
    synchronize: mode !== 'production' && process.env.DB_SYNCHRONIZE !== 'false',
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
  };

  if (type === 'sqljs') {
    return new DataSource({
      ...options,
      type,
      location: ':memory:', // use in-memory database
      autoSave: false, // disable auto-save
      synchronize: true,
    });
  } else if (type === 'sqlite' || type === 'better-sqlite3') {
    const database = process.env.DB_DATABASE || ':memory:';
    if (database === ':memory:') options.synchronize = true;
    return new DataSource({ ...options, type: 'better-sqlite3', database });
  } else {
    return new DataSource({
      ...options,
      type,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'gestion_documental',
      charset: 'utf8mb4',
      timezone: 'local',
    });
  }
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
