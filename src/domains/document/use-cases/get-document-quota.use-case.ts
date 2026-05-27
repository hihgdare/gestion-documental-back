import { DocumentRepository } from '../repositories/document.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export interface DocumentQuota {
  current: number;
  limit: number | null;
  exceeded: boolean;
}

export class GetDocumentQuotaUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(groupId: number): Promise<DocumentQuota> {
    const current = await this.documentRepository.countByGroupId(groupId);

    const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(groupId);
    if (!activeGroupPlan) {
      return { current, limit: null, exceeded: false };
    }

    const plan = await this.planRepository.findById(activeGroupPlan.planId);
    const limit = plan?.maxDocuments ?? null;

    return {
      current,
      limit,
      exceeded: limit !== null && current >= limit,
    };
  }
}
