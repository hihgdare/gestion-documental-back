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
    authorize('group:assign:plan'),
    validateRequest(assignPlanToGroupSchema, true),
    controller.assignPlanToGroup,
  );

  router.get('/group-plans/:id',
    authorize(['group:assign:plan', 'plan:read']),
    controller.getGroupPlan,
  );

  router.get('/groups/:groupId/plans',
    authorize(['group:assign:plan', 'plan:read']),
    controller.listGroupPlansByGroup,
  );

  router.get('/groups/:groupId/active-plan',
    authorize(['group:assign:plan', 'plan:read']),
    controller.getActiveGroupPlan,
  );

  router.put('/group-plans/:id',
    authorize('group:assign:plan'),
    validateRequest(updateGroupPlanSchema, true),
    controller.updateGroupPlan,
  );

  router.delete('/group-plans/:id',
    authorize('group:assign:plan'),
    controller.deleteGroupPlan,
  );

  return router;
};
