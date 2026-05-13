import { GroupPlan } from '../entities/group-plan.entity';

export interface GroupPlanRepository {
  findById(id: string): Promise<GroupPlan | null>;
  findByGroupId(groupId: number): Promise<GroupPlan[]>;
  findActiveByGroupId(groupId: number): Promise<GroupPlan | null>;
  save(groupPlan: GroupPlan): Promise<GroupPlan>;
  update(groupPlan: GroupPlan): Promise<GroupPlan>;
  delete(id: string): Promise<void>;
}
