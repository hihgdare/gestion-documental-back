import { Router } from 'express';
import { SignatureController } from '../controllers/signature.controller';
import { validateRequest } from '@shared/middleware/validation';
import { initiateSignatureSchema, validateSignatureCodeSchema, cancelSignatureSchema } from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';
import { requireFeature } from '@shared/middleware/feature.middleware';
import { GetGroupFeaturesUseCase } from '@domains/plan/use-cases/get-group-features.use-case';
import { FeatureKey } from '@domains/feature/value-objects/feature-keys';

export const createSignatureRoutes = (
  controller: SignatureController,
  getGroupFeaturesUseCase: GetGroupFeaturesUseCase,
): Router => {
  const router = Router();
  const requireSimpleSignature = requireFeature(FeatureKey.FIRMA_SIMPLE, getGroupFeaturesUseCase);

  // Public endpoints — no authentication required
  router.get('/verify/document/:documentId', controller.verifyDocumentById);
  router.get('/verify/document/:documentId/file', controller.getDocumentFilePublic);
  router.get('/verify/:tokenHash', controller.verifyByToken);
  router.get('/verify/:documentId/:tokenHash', controller.verifyByDocumentAndToken);
  router.get('/verify/:documentId/:tokenHash/file', controller.getDocumentFileByVerification);

  // Protected endpoints
  router.use(auth);

  router.get('/sms-default-phone', authorize('signature:create'), requireSimpleSignature, controller.getDefaultSmsPhone);
  router.get('/my-signature', authorize('signature:create'), requireSimpleSignature, controller.getMySignature);
  router.post('/initiate', authorize('signature:create'), requireSimpleSignature, validateRequest(initiateSignatureSchema, true), controller.initiate);
  router.post('/validate', authorize('signature:create'), requireSimpleSignature, validateRequest(validateSignatureCodeSchema, true), controller.validate);
  router.post('/cancel', authorize('signature:create'), requireSimpleSignature, validateRequest(cancelSignatureSchema, true), controller.cancel);
  router.get('/document/:documentId', authorize('signature:read'), requireSimpleSignature, controller.getByDocument);

  return router;
};
