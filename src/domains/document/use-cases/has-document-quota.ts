import { DocumentRepository } from '../repositories/document.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export async function hasDocumentQuotaAvailable(
  groupId: number,
  documentRepository: DocumentRepository,
  groupPlanRepository: GroupPlanRepository,
  planRepository: PlanRepository,
): Promise<boolean> {
  const activeGroupPlan = await groupPlanRepository.findActiveByGroupId(groupId);
  if (!activeGroupPlan) return true;

  const plan = await planRepository.findById(activeGroupPlan.planId);
  if (!plan || plan.maxDocuments === null) return true;

  const currentCount = await documentRepository.countByGroupId(groupId);
  return currentCount < plan.maxDocuments;
}
