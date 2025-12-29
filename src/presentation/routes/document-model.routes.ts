import { Router } from 'express';
import { DocumentModelController } from '../controllers/document-model.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createDocumentModelSchema,
  updateDocumentModelSchema,
} from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createDocumentModelRoutes = (documentModelController: DocumentModelController): Router => {
  const router = Router();
  router.use(auth);

  // POST /api/document-models - Create a new document model
  router.post('/', authorize('document-model:create'), validateRequest(createDocumentModelSchema), documentModelController.createDocumentModel);

  // GET /api/document-models - Get all document models
  router.get('/', authorize('document-model:read'), documentModelController.getAllDocumentModels);

  // GET /api/document-models/family/:familyId - Get document models by family ID
  router.get('/family/:familyId', authorize('document-model:read'), documentModelController.getDocumentModelsByFamilyId);

  // GET /api/document-models/:id - Get document model by ID
  router.get('/:id', authorize('document-model:read'), documentModelController.getDocumentModelById);

  // PUT /api/document-models/:id - Update document model
  router.put('/:id', authorize('document-model:update'), validateRequest(updateDocumentModelSchema), documentModelController.updateDocumentModel);

  // DELETE /api/document-models/:id - Delete document model
  router.delete('/:id', authorize('document-model:delete'), documentModelController.deleteDocumentModel);

  return router;
};
