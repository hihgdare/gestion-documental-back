import { Router } from 'express';
import { DocumentTemplateController } from '../controllers/document-template.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createDocumentTemplateSchema, updateDocumentTemplateSchema } from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createDocumentTemplateRoutes = (controller: DocumentTemplateController): Router => {
  const router = Router();
  router.use(auth);

  router.post('/', authorize('document:create'), validateRequest(createDocumentTemplateSchema, true), controller.create);
  router.get('/', authorize('document:read'), controller.getAll);
  router.get('/:id', authorize('document:read'), controller.getById);
  router.put('/:id', authorize('document:update'), validateRequest(updateDocumentTemplateSchema, true), controller.update);
  router.delete('/:id', authorize('document:delete'), controller.delete);

  return router;
};
