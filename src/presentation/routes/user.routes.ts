import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
} from '../dto/validation-schemas';

export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  // POST /api/users - Create a new user
  router.post('/', validateRequest(createUserSchema), userController.createUser);

  // GET /api/users - Get all users
  router.get('/', userController.getAllUsers);

  // GET /api/users/:id - Get user by ID
  router.get('/:id', userController.getUserById);

  // PUT /api/users/:id - Update user
  router.put('/:id', validateRequest(updateUserSchema), userController.updateUser);

  // DELETE /api/users/:id - Delete user
  router.delete('/:id', userController.deleteUser);

  return router;
};