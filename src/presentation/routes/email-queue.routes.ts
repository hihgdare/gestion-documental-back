import { Router } from 'express';
import { EmailQueueController } from '../controllers/email-queue.controller';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createEmailQueueRoutes = (controller: EmailQueueController): Router => {
  const router = Router();

  router.use(auth);

  router.get('/stats', authorize('email-queue:admin'), controller.getStats);
  router.get('/', authorize('email-queue:admin'), controller.listJobs);
  router.post('/:id/retry', authorize('email-queue:admin'), controller.retryJob);

  return router;
};
