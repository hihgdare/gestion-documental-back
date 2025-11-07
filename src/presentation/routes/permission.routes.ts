import { Router } from 'express';
import { PermissionController } from '../controllers/permission.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createPermissionSchema, updatePermissionSchema } from '../dto/validation-schemas';

export const createPermissionRoutes = (permissionController: PermissionController): Router => {
  const router = Router();

  // CRUD Permisos
  router.post('/', validateRequest(createPermissionSchema), permissionController.createPermission);
  router.get('/', permissionController.getAllPermissions);
  router.get('/:id', permissionController.getPermissionById);
  router.put('/:id', validateRequest(updatePermissionSchema), permissionController.updatePermission);
  router.delete('/:id', permissionController.deletePermission);

  return router;
};
