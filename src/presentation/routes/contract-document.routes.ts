import { Router } from 'express';
import { ContractDocumentController } from '../controllers/contract-document.controller';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createContractDocumentRoutes = (controller: ContractDocumentController): Router => {
  const router = Router();
  router.use(auth);

  // GET /api/contract-documents - list relation entries
  router.get('/', authorize('contract:read'), controller.listContractDocuments);

  return router;
};
