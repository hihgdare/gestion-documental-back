import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createContractSchema,
  updateContractSchema,
  getContractByIdSchema,
} from '../dto/validation-schemas';

export const createContractRoutes = (contractController: ContractController): Router => {
  const router = Router();

  // POST /api/contracts - Create a new contract
  router.post('/', validateRequest(createContractSchema), contractController.createContract);

  // GET /api/contracts - Get all contracts
  router.get('/', contractController.getAllContracts);

  // GET /api/contracts/active - Get active contracts
  router.get('/active', contractController.getActiveContracts);

  // GET /api/contracts/:id - Get contract by ID
  router.get('/:id', contractController.getContractById);

  // GET /api/contracts/employee/:employeeId - Get contracts by employee
  router.get('/employee/:employeeId', contractController.getContractsByEmployee);

  // PUT /api/contracts/:id - Update contract
  router.put('/:id', validateRequest(updateContractSchema), contractController.updateContract);

  // PATCH /api/contracts/:id/activate - Activate contract
  router.patch('/:id/activate', contractController.activateContract);

  // PATCH /api/contracts/:id/suspend - Suspend contract
  router.patch('/:id/suspend', contractController.suspendContract);

  // PATCH /api/contracts/:id/terminate - Terminate contract
  router.patch('/:id/terminate', contractController.terminateContract);

  // DELETE /api/contracts/:id - Delete contract
  router.delete('/:id', contractController.deleteContract);

  return router;
};