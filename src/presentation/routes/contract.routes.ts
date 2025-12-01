import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createContractSchema,
  updateContractSchema,
} from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createContractRoutes = (contractController: ContractController): Router => {
  const router = Router();
  router.use(auth);

  // POST /api/contracts - Create a new contract
  router.post('/', authorize('contract:create'), validateRequest(createContractSchema, true), contractController.createContract);

  // GET /api/contracts - Get all contracts
  router.get('/', authorize('contract:read'), contractController.getAllContracts);

  // GET /api/contracts/active - Get active contracts
  router.get('/active', authorize('contract:read'), contractController.getActiveContracts);

  // GET /api/contracts/expired - Get expired contracts
  router.get('/expired', authorize('contract:read'), contractController.getExpiredContracts);

  // GET /api/contracts/ending-before - Get contracts ending before date (query: ?date=2024-12-31)
  router.get('/ending-before', authorize('contract:read'), contractController.getContractsEndingBefore);

  // GET /api/contracts/rut-sociedad/:rutSociedad - Get contracts by RUT sociedad
  router.get('/rut-sociedad/:rutSociedad', authorize('contract:read'), contractController.getContractsByRutSociedad);

  // GET /api/contracts/colaborador/:nombre - Get contracts by colaborador name
  router.get('/colaborador/:nombre', authorize('contract:read'), contractController.getContractsByNombreColaborador);

  // GET /api/contracts/mandante/:mandante - Get contracts by mandante
  router.get('/mandante/:mandante', authorize('contract:read'), contractController.getContractsByMandante);

  // GET /api/contracts/division/:division - Get contracts by division
  router.get('/division/:division', authorize('contract:read'), contractController.getContractsByDivision);

  // GET /api/contracts/area/:area - Get contracts by area
  router.get('/area/:area', authorize('contract:read'), contractController.getContractsByArea);

  // GET /api/contracts/number/:contractNumber - Get contract by number
  router.get('/number/:contractNumber', authorize('contract:read'), contractController.getContractByNumber);

  // GET /api/contracts/:id - Get contract by ID
  router.get('/:id', authorize('contract:read'), contractController.getContractById);

  // PUT /api/contracts/:id - Update contract
  router.put('/:id', authorize('contract:update'), validateRequest(updateContractSchema, true), contractController.updateContract);

  // PATCH /api/contracts/:id/activate - Activate contract
  router.patch('/:id/activate', authorize('contract:update'), contractController.activateContract);

  // PATCH /api/contracts/:id/suspend - Suspend contract
  router.patch('/:id/suspend', authorize('contract:update'), contractController.suspendContract);

  // PATCH /api/contracts/:id/terminate - Terminate contract
  router.patch('/:id/terminate', authorize('contract:update'), contractController.terminateContract);

  // DELETE /api/contracts/:id - Delete contract
  router.delete('/:id', authorize('contract:delete'), contractController.deleteContract);

  // Subcontract management routes (use same contract permissions)
  // POST /api/contracts/:id/subcontracts - Add a subcontract to a contract
  router.post('/:id/subcontracts', authorize('contract:update'), contractController.addSubcontract);

  // DELETE /api/contracts/:id/subcontracts/:subcontractId - Remove a subcontract from a contract
  router.delete('/:id/subcontracts/:subcontractId', authorize('contract:update'), contractController.removeSubcontract);

  // GET /api/contracts/:id/subcontracts - Get all subcontracts of a contract
  router.get('/:id/subcontracts', authorize('contract:read'), contractController.getSubcontracts);

  // Document association routes
  // POST /api/contracts/:id/documents - Link a document to a contract
  router.post('/:id/documents', authorize('contract:update'), contractController.addDocument);

  // DELETE /api/contracts/:id/documents/:documentId - Unlink a document from a contract
  router.delete('/:id/documents/:documentId', authorize('contract:update'), contractController.removeDocument);

  // GET /api/contracts/:id/documents - List all documents linked to a contract
  router.get('/:id/documents', authorize('contract:read'), contractController.getDocuments);

  return router;
};
