import { Router } from 'express';
import { SignatureController } from '../controllers/signature.controller';
import { validateRequest } from '@shared/middleware/validation';
import { initiateSignatureSchema, validateSignatureCodeSchema, cancelSignatureSchema } from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createSignatureRoutes = (controller: SignatureController): Router => {
  const router = Router();

  // Public endpoint — verify signature by token hash (for QR code scanning)
  router.get('/verify/:tokenHash', controller.verifyByToken);

  // Protected endpoints
  router.use(auth);

  router.post('/initiate', authorize('signature:create'), validateRequest(initiateSignatureSchema, true), controller.initiate);
  router.post('/validate', authorize('signature:update'), validateRequest(validateSignatureCodeSchema, true), controller.validate);
  router.post('/cancel', authorize('signature:update'), validateRequest(cancelSignatureSchema, true), controller.cancel);
  router.get('/document/:documentId', authorize('signature:read'), controller.getByDocument);

  return router;
};
