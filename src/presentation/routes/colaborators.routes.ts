import { Router } from 'express';
import { ColaboratorController } from '../controllers/colaborators.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createColaboratorSchema,
  updateColaboratorSchema,
  updateColaboratorContractsSchema,
} from '../dto/validation-schemas';

export const createColaboratorRoutes = (colaboratorController: ColaboratorController): Router => {
  const router = Router();

  // POST /api/colaborators - Create a new colaborator
  router.post('/', validateRequest(createColaboratorSchema), colaboratorController.createColaborator);

  // GET /api/colaborators - Get all colaborators
  router.get('/', colaboratorController.getAllColaborators);

  // GET /api/colaborators/active - Get active colaborators
  router.get('/active', colaboratorController.getActiveColaborators);

  // GET /api/colaborators/search - Search colaborators by name (query: ?name=Juan)
  router.get('/search', colaboratorController.searchColaboratorsByName);

  // GET /api/colaborators/document/:numeroDocumento - Get colaborator by document number
  router.get('/document/:numeroDocumento', colaboratorController.getColaboratorByDocumentNumber);

  // GET /api/colaborators/email/:email - Get colaborator by email
  router.get('/email/:email', colaboratorController.getColaboratorByEmail);

  // GET /api/colaborators/:id - Get colaborator by ID
  router.get('/:id', colaboratorController.getColaboratorById);

  // GET /api/colaborators/:id/groups - Get colaborator groups
  router.get('/:id/groups', colaboratorController.getColaboratorGroups);

  // GET /api/colaborators/:id/contracts - Get colaborator contracts
  router.get('/:id/contracts', colaboratorController.getColaboratorContracts);

  // PUT /api/colaborators/:id/contracts - Update colaborator contracts
  router.put('/:id/contracts', validateRequest(updateColaboratorContractsSchema), colaboratorController.updateColaboratorContracts);

  // PUT /api/colaborators/:id - Update colaborator
  router.put('/:id', validateRequest(updateColaboratorSchema), colaboratorController.updateColaborator);

  // PATCH /api/colaborators/:id/activate - Activate colaborator
  router.patch('/:id/activate', colaboratorController.activateColaborator);

  // PATCH /api/colaborators/:id/suspend - Suspend colaborator
  router.patch('/:id/suspend', colaboratorController.suspendColaborator);

  // PATCH /api/colaborators/:id/deactivate - Deactivate colaborator
  router.patch('/:id/deactivate', colaboratorController.deactivateColaborator);

  // PATCH /api/colaborators/:id/terminate - Terminate colaborator
  router.patch('/:id/terminate', colaboratorController.terminateColaborator);

  return router;
};
