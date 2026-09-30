import { DocumentRepository } from '../repositories/document.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { PlanQuotaExceededError } from '@shared/domain/errors';
import { BYTES_PER_GB } from '@shared/utils/storage';

export async function assertStorageQuotaNotExceeded(
  groupId: number,
  incomingFileSizeBytes: number,
  documentRepository: DocumentRepository,
  groupPlanRepository: GroupPlanRepository,
  planRepository: PlanRepository,
): Promise<void> {
  if (incomingFileSizeBytes <= 0) return;

  const activeGroupPlan = await groupPlanRepository.findActiveByGroupId(groupId);
  if (!activeGroupPlan) return;

  const plan = await planRepository.findById(activeGroupPlan.planId);
  if (!plan || plan.maxStorageGb === null) return;

  const limitBytes = plan.maxStorageGb * BYTES_PER_GB;
  const currentBytes = await documentRepository.getStorageUsedByGroupId(groupId);

  if (currentBytes + incomingFileSizeBytes > limitBytes) {
    const currentGb = Math.round((currentBytes / BYTES_PER_GB) * 100) / 100;
    throw new PlanQuotaExceededError(
      'almacenamiento',
      plan.maxStorageGb,
      currentGb,
      `Has alcanzado el límite de almacenamiento de tu plan (${currentGb} GB de ${plan.maxStorageGb} GB utilizados)`,
    );
  }
}
