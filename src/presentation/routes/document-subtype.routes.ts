import { Router } from 'express';
import { DocumentSubtypeController } from '../controllers/document-subtype.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createDocumentSubtypeSchema,
  updateDocumentSubtypeSchema,
} from '../dto/validation-schemas';

export const createDocumentSubtypeRoutes = (documentSubtypeController: DocumentSubtypeController): Router => {
  const router = Router();

  // POST /api/document-subtypes - Create a new document subtype
  router.post('/', validateRequest(createDocumentSubtypeSchema), documentSubtypeController.createDocumentSubtype);

  // GET /api/document-subtypes - Get all document subtypes
  router.get('/', documentSubtypeController.getAllDocumentSubtypes);

  // GET /api/document-subtypes/by-type/:documentTypeId - Get document subtypes by document type
  router.get('/by-type/:documentTypeId', documentSubtypeController.getDocumentSubtypesByDocumentTypeId);

  // GET /api/document-subtypes/:id - Get document subtype by ID
  router.get('/:id', documentSubtypeController.getDocumentSubtypeById);

  // PUT /api/document-subtypes/:id - Update document subtype
  router.put('/:id', validateRequest(updateDocumentSubtypeSchema), documentSubtypeController.updateDocumentSubtype);

  // DELETE /api/document-subtypes/:id - Delete document subtype
  router.delete('/:id', documentSubtypeController.deleteDocumentSubtype);

  return router;
};
