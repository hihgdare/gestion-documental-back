/// <reference types="bun" />
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

process.env.NODE_ENV = 'test';
process.env.TZ = 'America/Santiago';
process.env.DB_TYPE = process.env.TEST_DB_TYPE || 'sqljs';
process.env.DB_DATABASE = process.env.TEST_DB_DATABASE || 'gestion_documental_test';

const testConnectionVars = {
  DB_HOST: process.env.TEST_DB_HOST,
  DB_PORT: process.env.TEST_DB_PORT,
  DB_USERNAME: process.env.TEST_DB_USERNAME,
  DB_PASSWORD: process.env.TEST_DB_PASSWORD,
};
for (const [name, value] of Object.entries(testConnectionVars)) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

afterAll(async () => {
  const { AppDataSource } = await import('@shared/infrastructure/database/typeorm.config');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

export { describe, it, expect, beforeAll, afterAll };
