import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { auth } from '@shared/middleware/auth.middleware';

export function createFileRoutes(fileController: FileController): Router {
  const router = Router();
  router.use(auth);
  router.post('/', fileController.upload);
  return router;
}

