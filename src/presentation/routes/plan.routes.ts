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
  assignFeaturesToPlanSchema,
  setGroupFeatureOverrideSchema,
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
    authorize(['plan:read', 'group:assign:plan']),
    controller.listPlans,
  );

  router.get('/:id',
    authorize(['plan:read', 'group:assign:plan']),
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

  // Feature catalog & plan assignment

  router.get('/features/catalog',
    authorize(['plan:read', 'plan:update', 'group:assign:plan']),
    controller.listFeatureCatalog,
  );

  router.put('/:id/features',
    authorize('plan:update'),
    validateRequest(assignFeaturesToPlanSchema, true),
    controller.assignFeaturesToPlan,
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

  // Group feature overrides (custom/personalized plans)

  router.get('/groups/:groupId/features',
    authorize(['group:assign:plan', 'plan:read']),
    controller.getGroupFeatures,
  );

  router.put('/groups/:groupId/features/:featureId',
    authorize('group:assign:plan'),
    validateRequest(setGroupFeatureOverrideSchema, true),
    controller.setGroupFeatureOverride,
  );

  router.delete('/groups/:groupId/features/:featureId',
    authorize('group:assign:plan'),
    controller.removeGroupFeatureOverride,
  );

  return router;
};
