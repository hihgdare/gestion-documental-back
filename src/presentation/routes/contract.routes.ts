import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createContractSchema,
  updateContractSchema,
} from '../dto/validation-schemas';

export const createContractRoutes = (contractController: ContractController): Router => {
  const router = Router();

  // POST /api/contracts - Create a new contract
  router.post('/', validateRequest(createContractSchema, true), contractController.createContract);

  // GET /api/contracts - Get all contracts
  router.get('/', contractController.getAllContracts);

  // GET /api/contracts/active - Get active contracts
  router.get('/active', contractController.getActiveContracts);

  // GET /api/contracts/expired - Get expired contracts
  router.get('/expired', contractController.getExpiredContracts);

  // GET /api/contracts/ending-before - Get contracts ending before date (query: ?date=2024-12-31)
  router.get('/ending-before', contractController.getContractsEndingBefore);

  // GET /api/contracts/rut-sociedad/:rutSociedad - Get contracts by RUT sociedad
  router.get('/rut-sociedad/:rutSociedad', contractController.getContractsByRutSociedad);

  // GET /api/contracts/colaborador/:nombre - Get contracts by colaborador name
  router.get('/colaborador/:nombre', contractController.getContractsByNombreColaborador);

  // GET /api/contracts/mandante/:mandante - Get contracts by mandante
  router.get('/mandante/:mandante', contractController.getContractsByMandante);

  // GET /api/contracts/division/:division - Get contracts by division
  router.get('/division/:division', contractController.getContractsByDivision);

  // GET /api/contracts/area/:area - Get contracts by area
  router.get('/area/:area', contractController.getContractsByArea);

  // GET /api/contracts/number/:contractNumber - Get contract by number
  router.get('/number/:contractNumber', contractController.getContractByNumber);

  // GET /api/contracts/:id - Get contract by ID
  router.get('/:id', contractController.getContractById);

  // PUT /api/contracts/:id - Update contract
  router.put('/:id', validateRequest(updateContractSchema, true), contractController.updateContract);

  // PATCH /api/contracts/:id/activate - Activate contract
  router.patch('/:id/activate', contractController.activateContract);

  // PATCH /api/contracts/:id/suspend - Suspend contract
  router.patch('/:id/suspend', contractController.suspendContract);

  // PATCH /api/contracts/:id/terminate - Terminate contract
  router.patch('/:id/terminate', contractController.terminateContract);

  // DELETE /api/contracts/:id - Delete contract
  router.delete('/:id', contractController.deleteContract);

  // Subcontract management routes
  // POST /api/contracts/:id/subcontracts - Add a subcontract to a contract
  router.post('/:id/subcontracts', contractController.addSubcontract);

  // DELETE /api/contracts/:id/subcontracts/:subcontractId - Remove a subcontract from a contract
  router.delete('/:id/subcontracts/:subcontractId', contractController.removeSubcontract);

  // GET /api/contracts/:id/subcontracts - Get all subcontracts of a contract
  router.get('/:id/subcontracts', contractController.getSubcontracts);

  return router;
};

