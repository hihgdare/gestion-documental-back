import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createRoleSchema, updateRoleSchema, assignPermissionsSchema } from '../dto/validation-schemas';

export const createRoleRoutes = (roleController: RoleController): Router => {
  const router = Router();

  // CRUD Roles
  router.post('/', validateRequest(createRoleSchema), roleController.createRole);
  router.get('/', roleController.getRoles);
  router.get('/:id', roleController.getRoleById);
  router.put('/:id', validateRequest(updateRoleSchema), roleController.updateRole);
  router.delete('/:id', roleController.deleteRole);

  // Role Permissions
  router.get('/:id/permissions', roleController.getPermissions);
  router.post('/:id/permissions', validateRequest(assignPermissionsSchema), roleController.assignPermissions);

  return router;
};
