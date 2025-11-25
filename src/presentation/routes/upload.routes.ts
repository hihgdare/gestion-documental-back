import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { auth } from '@shared/middleware/auth.middleware';

export function createUploadRoutes(uploadController: UploadController): Router {
  const router = Router();
  router.use(auth);
  router.post('/', uploadController.upload);
  return router;
}

