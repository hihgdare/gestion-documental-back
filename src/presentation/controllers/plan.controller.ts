import { Request, Response } from 'express';
import { CreatePlanUseCase } from '@domains/plan/use-cases/create-plan.use-case';
import { GetPlanUseCase, ListPlansUseCase } from '@domains/plan/use-cases/get-plan.use-case';
import { UpdatePlanUseCase, DeletePlanUseCase } from '@domains/plan/use-cases/update-plan.use-case';
import { AssignPlanToGroupUseCase } from '@domains/plan/use-cases/assign-plan-to-group.use-case';
import {
  GetGroupPlanUseCase,
  ListGroupPlansByGroupUseCase,
  GetActiveGroupPlanUseCase,
} from '@domains/plan/use-cases/get-group-plan.use-case';
import { UpdateGroupPlanUseCase, DeleteGroupPlanUseCase } from '@domains/plan/use-cases/update-group-plan.use-case';
import { AssignFeaturesToPlanUseCase } from '@domains/plan/use-cases/assign-features-to-plan.use-case';
import { GetGroupFeaturesUseCase } from '@domains/plan/use-cases/get-group-features.use-case';
import {
  SetGroupFeatureOverrideUseCase,
  RemoveGroupFeatureOverrideUseCase,
} from '@domains/plan/use-cases/set-group-feature-override.use-case';
import { ListFeatureCatalogUseCase } from '@domains/feature/use-cases/list-feature-catalog.use-case';
import { CreatePlanDto } from '../dto/plan/create-plan.dto';
import { UpdatePlanDto } from '../dto/plan/update-plan.dto';
import { AssignPlanToGroupDto } from '../dto/plan/assign-plan-to-group.dto';
import { UpdateGroupPlanDto } from '../dto/plan/update-group-plan.dto';
import { AssignFeaturesToPlanDto } from '../dto/plan/assign-features-to-plan.dto';
import { SetGroupFeatureOverrideDto } from '../dto/plan/set-group-feature-override.dto';

export class PlanController {
  constructor(
    private readonly createPlanUseCase: CreatePlanUseCase,
    private readonly getPlanUseCase: GetPlanUseCase,
    private readonly listPlansUseCase: ListPlansUseCase,
    private readonly updatePlanUseCase: UpdatePlanUseCase,
    private readonly deletePlanUseCase: DeletePlanUseCase,
    private readonly assignPlanToGroupUseCase: AssignPlanToGroupUseCase,
    private readonly getGroupPlanUseCase: GetGroupPlanUseCase,
    private readonly listGroupPlansByGroupUseCase: ListGroupPlansByGroupUseCase,
    private readonly getActiveGroupPlanUseCase: GetActiveGroupPlanUseCase,
    private readonly updateGroupPlanUseCase: UpdateGroupPlanUseCase,
    private readonly deleteGroupPlanUseCase: DeleteGroupPlanUseCase,
    private readonly listFeatureCatalogUseCase: ListFeatureCatalogUseCase,
    private readonly assignFeaturesToPlanUseCase: AssignFeaturesToPlanUseCase,
    private readonly getGroupFeaturesUseCase: GetGroupFeaturesUseCase,
    private readonly setGroupFeatureOverrideUseCase: SetGroupFeatureOverrideUseCase,
    private readonly removeGroupFeatureOverrideUseCase: RemoveGroupFeatureOverrideUseCase,
  ) {}

  // Feature catalog & assignment

  public listFeatureCatalog = async (_req: Request, res: Response) => {
    const catalog = await this.listFeatureCatalogUseCase.execute();
    res.status(200).json({ success: true, data: catalog });
  };

  public assignFeaturesToPlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { featureIds } = req.body as AssignFeaturesToPlanDto;
    const plan = await this.assignFeaturesToPlanUseCase.execute(id, featureIds);
    res.status(200).json({ success: true, data: plan.toJSON() });
  };

  public getGroupFeatures = async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const result = await this.getGroupFeaturesUseCase.execute(groupId);
    res.status(200).json({ success: true, data: result });
  };

  public setGroupFeatureOverride = async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const { featureId } = req.params;
    const { granted } = req.body as SetGroupFeatureOverrideDto;
    const override = await this.setGroupFeatureOverrideUseCase.execute(groupId, featureId, granted);
    res.status(200).json({ success: true, data: override.toJSON() });
  };

  public removeGroupFeatureOverride = async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const { featureId } = req.params;
    await this.removeGroupFeatureOverrideUseCase.execute(groupId, featureId);
    res.status(200).json({ success: true, message: 'Feature override removed successfully' });
  };

  // Plans CRUD

  public createPlan = async (req: Request, res: Response) => {
    const dto = req.body as CreatePlanDto;
    const plan = await this.createPlanUseCase.execute(dto);
    res.status(201).json({ success: true, data: plan.toJSON() });
  };

  public getPlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const plan = await this.getPlanUseCase.execute(id);
    res.status(200).json({ success: true, data: plan.toJSON() });
  };

  public listPlans = async (_req: Request, res: Response) => {
    const plans = await this.listPlansUseCase.execute();
    res.status(200).json({ success: true, data: plans.map(p => p.toJSON()) });
  };

  public updatePlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto = req.body as UpdatePlanDto;
    const plan = await this.updatePlanUseCase.execute({ ...dto, id });
    res.status(200).json({ success: true, data: plan.toJSON() });
  };

  public deletePlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deletePlanUseCase.execute(id);
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  };

  // Group Plans

  public assignPlanToGroup = async (req: Request, res: Response) => {
    const dto = req.body as AssignPlanToGroupDto;
    const groupPlan = await this.assignPlanToGroupUseCase.execute({
      ...dto,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
    });
    res.status(201).json({ success: true, data: groupPlan.toJSON() });
  };

  public getGroupPlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const groupPlan = await this.getGroupPlanUseCase.execute(id);
    res.status(200).json({ success: true, data: groupPlan.toJSON() });
  };

  public listGroupPlansByGroup = async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const groupPlans = await this.listGroupPlansByGroupUseCase.execute(groupId);
    res.status(200).json({ success: true, data: groupPlans.map(gp => gp.toJSON()) });
  };

  public getActiveGroupPlan = async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const groupPlan = await this.getActiveGroupPlanUseCase.execute(groupId);
    res.status(200).json({ success: true, data: groupPlan ? groupPlan.toJSON() : null });
  };

  public updateGroupPlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto = req.body as UpdateGroupPlanDto;
    const groupPlan = await this.updateGroupPlanUseCase.execute({
      id,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt !== undefined ? (dto.endsAt ? new Date(dto.endsAt) : null) : undefined,
      isActive: dto.isActive,
    });
    res.status(200).json({ success: true, data: groupPlan.toJSON() });
  };

  public deleteGroupPlan = async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteGroupPlanUseCase.execute(id);
    res.status(200).json({ success: true, message: 'GroupPlan deleted successfully' });
  };
}
