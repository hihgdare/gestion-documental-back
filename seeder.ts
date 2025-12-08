/// <reference types="node" />
import { initializeDatabase, clearDatabase, AppDataSource } from './src/shared/infrastructure/database/typeorm.config';
import runSeeds from './src/shared/infrastructure/database/seed/run-seeds';

async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');

  if (process.env.NODE_ENV !== 'development') {
    console.log('Seeds abortados: NODE_ENV no es development');
    process.exit(0);
  }

  try {
    await initializeDatabase();
    if (shouldClean) {
      console.log('Limpiando base de datos (development)...');
      await clearDatabase();
    }

    await runSeeds();
  } catch (err) {
    console.error('Error ejecutando seeds:', err);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

main();
