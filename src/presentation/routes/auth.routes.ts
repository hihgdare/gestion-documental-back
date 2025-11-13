import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '@shared/middleware/validation';
import { loginSchema } from '../dto/validation-schemas';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  // POST /api/auth/login - Login
  router.post('/login', validateRequest(loginSchema), authController.login);

  // GET /api/auth/me - Get current user from token
  router.get('/me', authController.getCurrentUser);

  return router;
};
