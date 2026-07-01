import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { auth } from '@shared/middleware/auth.middleware';

export function createAuthRoutes(authController: AuthController): Router {
  const authRouter = Router();

  authRouter.post('/login', authController.login);
  authRouter.post('/logout', authController.logout);
  authRouter.get('/permissions', auth, authController.getPermissions);
  authRouter.post('/refresh', auth, authController.refresh);
  authRouter.get('/me', auth, authController.getMe);
  authRouter.delete('/notifications/:id', auth, authController.deleteNotification);
  authRouter.delete('/notifications', auth, authController.clearNotifications);
  authRouter.post('/me', auth, authController.updateMe);
  authRouter.post('/change-password', auth, authController.changePassword);
  authRouter.post('/set-password', authController.setPassword);
  authRouter.get('/token', authController.getToken);
  authRouter.get('/group', authController.getGroup);

  return authRouter;
}
