import { Plan } from '../entities/plan.entity';

export interface PlanRepository {
  findById(id: string): Promise<Plan | null>;
  findAll(): Promise<Plan[]>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  save(plan: Plan, featureIds?: string[]): Promise<Plan>;
  update(plan: Plan, featureIds?: string[]): Promise<Plan>;
  delete(id: string): Promise<void>;
  setFeatures(planId: string, featureIds: string[]): Promise<Plan>;
}
