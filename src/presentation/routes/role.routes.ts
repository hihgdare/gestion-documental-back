import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createRoleSchema, updateRoleSchema } from '../dto/validation-schemas';

export const createRoleRoutes = (roleController: RoleController): Router => {
  const router = Router();

  // CRUD Roles
  router.post('/', validateRequest(createRoleSchema), roleController.createRole);
  router.get('/', roleController.getRoles);
  router.get('/:id', roleController.getRoleById);
  router.put('/:id', validateRequest(updateRoleSchema), roleController.updateRole);
  router.delete('/:id', roleController.deleteRole);

  return router;
};
