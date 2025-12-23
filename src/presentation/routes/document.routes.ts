import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { validateRequest } from '@shared/middleware/validation';
import { createDocumentSchema, updateDocumentSchema, assignDocumentsFromTypeSubtypeToGroupSchema } from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';
import { RequestHandler } from 'express';

export const createDocumentRoutes = (
  controller: DocumentController,
  contractReviewerMiddleware: RequestHandler,
): Router => {
  const router = Router();

  // Rutas públicas
  router.get('/dashboard/metrics', controller.getDashboardMetrics);

  router.use(auth);

  // POST routes
  router.post('/', authorize('document:create'), validateRequest(createDocumentSchema, true), controller.createDocument);
  router.post('/assign-type-subtype-to-group', authorize('document:create'), validateRequest(assignDocumentsFromTypeSubtypeToGroupSchema, true), controller.assignDocumentsFromTypeSubtypeToGroup);

  // GET routes - specific routes before parameterized routes
  router.get('/expired', authorize('document:read'), controller.getExpiredDocuments);
  router.get('/expiring/:days', authorize('document:read'), controller.getExpiringDocuments);
  router.get('/by-contract/:contractId', authorize('document:read'), controller.getDocumentsByContractId);
  router.get('/by-type-subtype/:typeId/:subtypeId', authorize('document:read'), controller.getDocumentsByTypeAndSubtypeId);
  router.get('/by-colaborator/:colaboratorId', authorize('document:read'), controller.getDocumentsByColaboratorId);
  router.get('/', authorize('document:read'), controller.getAllDocuments);
  router.get('/:id', authorize('document:read'), controller.getDocumentById);

  // PUT routes
  router.put('/:id/send-to-review', authorize('document:update'), controller.sendToReview);

  // Rutas de revisión - requieren permiso document:review Y ser revisor activo del contrato
  router.put('/:id/approve', authorize('document:review'), contractReviewerMiddleware, controller.approveDocument);
  router.put('/:id/reject', authorize('document:review'), contractReviewerMiddleware, controller.rejectDocument);
  router.put('/:id/reject-with-comments', authorize('document:review'), contractReviewerMiddleware, controller.rejectDocumentWithComments);
  router.put('/:id', authorize('document:update'), validateRequest(updateDocumentSchema, true), controller.updateDocument);

  // DELETE routes
  router.delete('/:id', authorize('document:delete'), controller.deleteDocument);

  return router;
};
