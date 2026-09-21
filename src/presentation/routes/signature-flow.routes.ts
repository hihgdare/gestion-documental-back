import { Router } from 'express';
import { SignatureFlowController } from '../controllers/signature-flow.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createSignatureFlowSchema,
  updateSignatureFlowSchema,
  addSignatureFlowParticipantSchema,
  processSignatureFlowParticipantActionSchema,
  resendSignatureFlowNotificationSchema,
  skipSignerSchema,
  closeSignatureFlowSchema,
  reopenSignatureFlowSchema,
} from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';
import { requireFeature } from '@shared/middleware/feature.middleware';
import { GetGroupFeaturesUseCase } from '@domains/plan/use-cases/get-group-features.use-case';
import { FeatureKey } from '@domains/feature/value-objects/feature-keys';

export const createSignatureFlowRoutes = (
  controller: SignatureFlowController,
  getGroupFeaturesUseCase: GetGroupFeaturesUseCase,
): Router => {
  const router = Router();
  const requireSimpleSignature = requireFeature(FeatureKey.FIRMA_SIMPLE, getGroupFeaturesUseCase);
  const requireTraceability = requireFeature(FeatureKey.FIRMA_TRAZABILIDAD, getGroupFeaturesUseCase);
  const requireReports = requireFeature(FeatureKey.FIRMA_REPORTES, getGroupFeaturesUseCase);

  router.use(auth);

  router.post(
    '/',
    authorize('signature-flow:create'),
    requireSimpleSignature,
    validateRequest(createSignatureFlowSchema, true),
    controller.create,
  );

  router.get('/my-pending', authorize('signature-flow:read'), requireSimpleSignature, controller.getMyPending);

  router.get('/reports/pending-documents', authorize('signature-flow:report:read'), requireReports, controller.getPendingDocumentsReport);

  router.get('/reports/signing-time', authorize('signature-flow:report:read'), requireReports, controller.getSigningTimeReport);

  router.get('/document/:documentId', authorize('signature-flow:read'), requireSimpleSignature, controller.getByDocument);

  router.get('/document/:documentId/tracking', authorize('signature-flow:read'), requireTraceability, controller.getDocumentTracking);

  router.get('/:id', authorize('signature-flow:read'), requireSimpleSignature, controller.getById);

  router.get('/:id/participants', authorize('signature-flow:read'), requireSimpleSignature, controller.getParticipants);

  router.put(
    '/:id',
    authorize('signature-flow:update'),
    requireSimpleSignature,
    validateRequest(updateSignatureFlowSchema, true),
    controller.update,
  );

  router.post(
    '/:id/participants',
    authorize('signature-flow:update'),
    requireSimpleSignature,
    validateRequest(addSignatureFlowParticipantSchema, true),
    controller.addParticipant,
  );

  router.delete('/:id/participants/:participantId', authorize('signature-flow:update'), requireSimpleSignature, controller.removeParticipant);

  router.get('/:id/resend-candidates', authorize('signature-flow:update'), requireSimpleSignature, controller.getResendCandidates);

  router.post(
    '/:id/resend-notifications',
    authorize('signature-flow:update'),
    requireSimpleSignature,
    validateRequest(resendSignatureFlowNotificationSchema, true),
    controller.resendNotifications,
  );

  router.post(
    '/:id/skip-signer',
    authorize('signature-flow:update'),
    requireSimpleSignature,
    validateRequest(skipSignerSchema, true),
    controller.skipSigner,
  );

  router.post(
    '/:id/close',
    authorize('signature-flow:update'),
    requireSimpleSignature,
    validateRequest(closeSignatureFlowSchema, true),
    controller.closeSignatureFlow,
  );

  router.post(
    '/:id/reopen',
    authorize('signature-flow:reopen'),
    requireSimpleSignature,
    validateRequest(reopenSignatureFlowSchema, true),
    controller.reopenSignatureFlow,
  );

  router.post(
    '/participants/:participantId/action',
    authorize('signature-flow:update'),
    requireSimpleSignature,
    validateRequest(processSignatureFlowParticipantActionSchema, true),
    controller.processParticipantAction,
  );

  router.delete('/:id', authorize('signature-flow:delete'), requireSimpleSignature, controller.delete);

  return router;
};
