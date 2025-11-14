import { Router } from 'express';
import { DocumentTypeController } from '../controllers/document-type.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
} from '../dto/validation-schemas';

export const createDocumentTypeRoutes = (documentTypeController: DocumentTypeController): Router => {
  const router = Router();

  // POST /api/document-types - Create a new document type
  router.post('/', validateRequest(createDocumentTypeSchema), documentTypeController.createDocumentType);

  // GET /api/document-types/with-subtypes - Get all document types with their subtypes
  router.get('/with-subtypes', documentTypeController.getAllDocumentTypesWithSubtypes);

  // GET /api/document-types/:id/with-subtypes - Get document type by ID with subtypes
  router.get('/:id/with-subtypes', documentTypeController.getDocumentTypeWithSubtypes);

  // GET /api/document-types - Get all document types
  router.get('/', documentTypeController.getAllDocumentTypes);

  // GET /api/document-types/:id - Get document type by ID
  router.get('/:id', documentTypeController.getDocumentTypeById);

  // PUT /api/document-types/:id - Update document type
  router.put('/:id', validateRequest(updateDocumentTypeSchema), documentTypeController.updateDocumentType);

  // DELETE /api/document-types/:id - Delete document type
  router.delete('/:id', documentTypeController.deleteDocumentType);

  return router;
};
