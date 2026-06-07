import { Router } from 'express';
import { SignatureFlowController } from '../controllers/signature-flow.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createSignatureFlowSchema,
  updateSignatureFlowSchema,
  addSignatureFlowParticipantSchema,
} from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createSignatureFlowRoutes = (controller: SignatureFlowController): Router => {
  const router = Router();

  router.use(auth);

  router.post(
    '/',
    authorize('signature_flow:create'),
    validateRequest(createSignatureFlowSchema, true),
    controller.create,
  );

  router.get('/my-pending', authorize('signature_flow:read'), controller.getMyPending);

  router.get('/reports/pending-documents', authorize('signature_flow:read'), controller.getPendingDocumentsReport);

  router.get('/reports/signing-time', authorize('signature_flow:read'), controller.getSigningTimeReport);

  router.get('/document/:documentId', authorize('signature_flow:read'), controller.getByDocument);

  router.get('/:id', authorize('signature_flow:read'), controller.getById);

  router.get('/:id/participants', authorize('signature_flow:read'), controller.getParticipants);

  router.put(
    '/:id',
    authorize('signature_flow:update'),
    validateRequest(updateSignatureFlowSchema, true),
    controller.update,
  );

  router.post(
    '/:id/participants',
    authorize('signature_flow:update'),
    validateRequest(addSignatureFlowParticipantSchema, true),
    controller.addParticipant,
  );

  router.delete('/:id/participants/:participantId', authorize('signature_flow:update'), controller.removeParticipant);

  router.delete('/:id', authorize('signature_flow:delete'), controller.delete);

  return router;
};
