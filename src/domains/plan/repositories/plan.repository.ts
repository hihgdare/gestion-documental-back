import { Plan } from '../entities/plan.entity';

export interface PlanRepository {
  findById(id: string): Promise<Plan | null>;
  findAll(): Promise<Plan[]>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  save(plan: Plan): Promise<Plan>;
  update(plan: Plan): Promise<Plan>;
  delete(id: string): Promise<void>;
}
