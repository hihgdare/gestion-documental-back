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
  authRouter.post('/me', auth, authController.updateMe);
  authRouter.get('/token', authController.getToken);

  return authRouter;
}
