/// <reference types="bun" />
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// Global test setup for Bun
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after tests
});

// Export test utilities for use in test files
export { describe, it, expect, beforeAll, afterAll };
