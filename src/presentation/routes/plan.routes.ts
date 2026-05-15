import { Router } from 'express';
import { PlanController } from '../controllers/plan.controller';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';
import { validateRequest } from '@shared/middleware/validation';
import {
  createPlanSchema,
  updatePlanSchema,
  assignPlanToGroupSchema,
  updateGroupPlanSchema,
} from '../dto/validation-schemas';

export const createPlanRoutes = (controller: PlanController) => {
  const router = Router();

  router.use(auth);

  // Plans
  router.post('/',
    authorize('plan:create'),
    validateRequest(createPlanSchema),
    controller.createPlan,
  );

  router.get('/',
    authorize('plan:read'),
    controller.listPlans,
  );

  router.get('/:id',
    authorize('plan:read'),
    controller.getPlan,
  );

  router.put('/:id',
    authorize('plan:update'),
    validateRequest(updatePlanSchema),
    controller.updatePlan,
  );

  router.delete('/:id',
    authorize('plan:delete'),
    controller.deletePlan,
  );

  // Group Plans
  router.post('/group-plans',
    authorize('plan:create'),
    validateRequest(assignPlanToGroupSchema, true),
    controller.assignPlanToGroup,
  );

  router.get('/group-plans/:id',
    authorize('plan:read'),
    controller.getGroupPlan,
  );

  router.get('/groups/:groupId/plans',
    authorize('plan:read'),
    controller.listGroupPlansByGroup,
  );

  router.get('/groups/:groupId/active-plan',
    authorize('plan:read'),
    controller.getActiveGroupPlan,
  );

  router.put('/group-plans/:id',
    authorize('plan:update'),
    validateRequest(updateGroupPlanSchema, true),
    controller.updateGroupPlan,
  );

  router.delete('/group-plans/:id',
    authorize('plan:delete'),
    controller.deleteGroupPlan,
  );

  return router;
};
