/// <reference types="bun" />
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// Global test setup for Bun
process.env.DB_TYPE = process.env.TEST_DB_TYPE || 'sqljs';
process.env.NODE_ENV = 'test';
process.env.TZ = 'America/Santiago';
process.env.DB_HOST = process.env.TEST_DB_HOST;
process.env.DB_PORT = process.env.TEST_DB_PORT;
process.env.DB_USERNAME = process.env.TEST_DB_USERNAME;
process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD;
process.env.DB_DATABASE = process.env.TEST_DB_DATABASE || 'gestion_documental_test';

// Export test utilities for use in test files
export { describe, it, expect, beforeAll, afterAll };
