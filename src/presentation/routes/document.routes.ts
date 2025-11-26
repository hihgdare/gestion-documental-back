import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createDocumentSchema, updateDocumentSchema } from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createDocumentRoutes = (controller: DocumentController): Router => {
  const router = Router();
  router.use(auth);

  // POST routes
  router.post('/', authorize('document:create'), validateRequest(createDocumentSchema, true), controller.createDocument);

  // GET routes - specific routes before parameterized routes
  router.get('/expired', authorize('document:read'), controller.getExpiredDocuments);
  router.get('/expiring/:days', authorize('document:read'), controller.getExpiringDocuments);
  router.get('/by-contract/:contractId', authorize('document:read'), controller.getDocumentsByContractId);
  router.get('/by-document-type/:documentTypeId', authorize('document:read'), controller.getDocumentsByDocumentTypeId);
  router.get('/by-document-subtype/:documentSubtypeId', authorize('document:read'), controller.getDocumentsByDocumentSubtypeId);
  router.get('/', authorize('document:read'), controller.getAllDocuments);
  router.get('/:id', authorize('document:read'), controller.getDocumentById);

  // PUT routes
  router.put('/:id/send-to-review', authorize('document:update'), controller.sendToReview);
  router.put('/:id/approve', authorize('document:update'), controller.approveDocument);
  router.put('/:id/reject', authorize('document:update'), controller.rejectDocument);
  router.put('/:id/reject-with-comments', authorize('document:update'), controller.rejectDocumentWithComments);
  router.put('/:id', authorize('document:update'), validateRequest(updateDocumentSchema, true), controller.updateDocument);

  // DELETE routes
  router.delete('/:id', authorize('document:delete'), controller.deleteDocument);

  return router;
};
