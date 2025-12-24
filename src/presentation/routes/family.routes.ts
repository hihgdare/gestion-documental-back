import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createFamilySchema,
  updateFamilySchema,
} from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createFamilyRoutes = (familyController: FamilyController): Router => {
  const router = Router();
  router.use(auth);

  // POST /api/families - Create a new family
  router.post('/', authorize('family:create'), validateRequest(createFamilySchema), familyController.createFamily);

  // GET /api/families - Get all families
  router.get('/', authorize('family:read'), familyController.getAllFamilies);

  // GET /api/families/:id - Get family by ID
  router.get('/:id', authorize('family:read'), familyController.getFamilyById);

  // PUT /api/families/:id - Update family
  router.put('/:id', authorize('family:update'), validateRequest(updateFamilySchema), familyController.updateFamily);

  // DELETE /api/families/:id - Delete family
  router.delete('/:id', authorize('family:delete'), familyController.deleteFamily);

  return router;
};
