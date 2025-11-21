import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createDocumentSchema, updateDocumentSchema } from '../dto/validation-schemas';

export const createDocumentRoutes = (controller: DocumentController): Router => {
  const router = Router();

  // POST routes
  router.post('/', validateRequest(createDocumentSchema, true), controller.createDocument);

  // GET routes - specific routes before parameterized routes
  router.get('/expired', controller.getExpiredDocuments);
  router.get('/expiring/:days', controller.getExpiringDocuments);
  router.get('/by-contract/:contractId', controller.getDocumentsByContractId);
  router.get('/by-document-type/:documentTypeId', controller.getDocumentsByDocumentTypeId);
  router.get('/by-document-subtype/:documentSubtypeId', controller.getDocumentsByDocumentSubtypeId);
  router.get('/', controller.getAllDocuments);
  router.get('/:id', controller.getDocumentById);

  // PUT routes
  router.put('/:id', validateRequest(updateDocumentSchema), controller.updateDocument);

  // DELETE routes
  router.delete('/:id', controller.deleteDocument);

  return router;
};
