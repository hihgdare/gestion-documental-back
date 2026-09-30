import { describe, it, expect, mock } from 'bun:test';
import { GroupPlan } from '../entities/group-plan.entity';
import { Plan, PlanProps } from '../entities/plan.entity';
import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { GetColaboratorQuotaUseCase } from '@domains/colaborators/use-cases/get-colaborator-quota.use-case';
import { GetContractQuotaUseCase } from '@domains/contract/use-cases/get-contract-quota.use-case';
import { GetDocumentQuotaUseCase } from '@domains/document/use-cases/get-document-quota.use-case';
import { GetUserQuotaUseCase } from '@domains/user/use-cases/get-user-quota.use-case';
import { assertStorageQuotaNotExceeded } from '@domains/document/use-cases/assert-storage-quota';
import { hasDocumentQuotaAvailable } from '@domains/document/use-cases/has-document-quota';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';
import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { PlanQuotaExceededError } from '@shared/domain/errors';
import { BYTES_PER_GB } from '@shared/utils/storage';

function makePlanRepos(planProps: Omit<PlanProps, 'name'> | null) {
  const groupPlanRepository = {
    findActiveByGroupId: mock(() => Promise.resolve(planProps ? new GroupPlan({ groupId: 1, planId: 'plan-id' }) : null)),
  } as unknown as GroupPlanRepository;
  const planRepository = {
    findById: mock(() => Promise.resolve(planProps ? new Plan({ name: 'Plan', ...planProps }) : null)),
  } as unknown as PlanRepository;
  return { groupPlanRepository, planRepository };
}

function makeDocumentRepo(count: number, storageBytes = 0): DocumentRepository {
  return {
    countByGroupId: mock(() => Promise.resolve(count)),
    getStorageUsedByGroupId: mock(() => Promise.resolve(storageBytes)),
  } as unknown as DocumentRepository;
}

describe('GetColaboratorQuotaUseCase', () => {
  const colaboratorRepo = (count: number) =>
    ({ countActiveByGroupId: mock(() => Promise.resolve(count)) }) as unknown as ColaboratorRepository;

  it('sin plan no hay límite', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos(null);
    const quota = await new GetColaboratorQuotaUseCase(colaboratorRepo(50), groupPlanRepository, planRepository).execute(1);
    expect(quota).toEqual({ current: 50, limit: null, exceeded: false });
  });

  it('marca exceeded al alcanzar el límite del plan', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxActiveColaborators: 10 });
    const quota = await new GetColaboratorQuotaUseCase(colaboratorRepo(10), groupPlanRepository, planRepository).execute(1);
    expect(quota).toEqual({ current: 10, limit: 10, exceeded: true });
  });
});

describe('GetContractQuotaUseCase', () => {
  const contractRepo = (count: number) =>
    ({ countActiveByGroupId: mock(() => Promise.resolve(count)) }) as unknown as ContractRepository;

  it('no marca exceeded bajo el límite', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxActiveContracts: 5 });
    const quota = await new GetContractQuotaUseCase(contractRepo(4), groupPlanRepository, planRepository).execute(1);
    expect(quota).toEqual({ current: 4, limit: 5, exceeded: false });
  });

  it('un límite nulo en el plan significa ilimitado', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxActiveContracts: null });
    const quota = await new GetContractQuotaUseCase(contractRepo(100), groupPlanRepository, planRepository).execute(1);
    expect(quota).toEqual({ current: 100, limit: null, exceeded: false });
  });
});

describe('GetUserQuotaUseCase', () => {
  const userRepo = (count: number) =>
    ({ countActiveByGroupId: mock(() => Promise.resolve(count)) }) as unknown as UserRepository;

  it('marca exceeded al alcanzar el límite del plan', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxActiveUsers: 3 });
    const quota = await new GetUserQuotaUseCase(userRepo(3), groupPlanRepository, planRepository).execute(1);
    expect(quota).toEqual({ current: 3, limit: 3, exceeded: true });
  });
});

describe('GetDocumentQuotaUseCase', () => {
  it('sin plan no hay límite de documentos ni de almacenamiento', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos(null);
    const quota = await new GetDocumentQuotaUseCase(makeDocumentRepo(7, 1234), groupPlanRepository, planRepository).execute(1);
    expect(quota).toEqual({
      current: 7,
      limit: null,
      exceeded: false,
      storage: { currentBytes: 1234, limitBytes: null, exceeded: false },
    });
  });

  it('calcula los límites de documentos y almacenamiento del plan', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxDocuments: 10, maxStorageGb: 2 });
    const quota = await new GetDocumentQuotaUseCase(
      makeDocumentRepo(3, 2 * BYTES_PER_GB),
      groupPlanRepository,
      planRepository,
    ).execute(1);
    expect(quota).toEqual({
      current: 3,
      limit: 10,
      exceeded: false,
      storage: { currentBytes: 2 * BYTES_PER_GB, limitBytes: 2 * BYTES_PER_GB, exceeded: true },
    });
  });
});

describe('assertStorageQuotaNotExceeded', () => {
  it('permite la subida si el grupo no tiene plan', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos(null);
    await expect(assertStorageQuotaNotExceeded(1, BYTES_PER_GB, makeDocumentRepo(0), groupPlanRepository, planRepository))
      .resolves.toBeUndefined();
  });

  it('permite la subida si queda espacio', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxStorageGb: 1 });
    await expect(assertStorageQuotaNotExceeded(1, 10, makeDocumentRepo(0, BYTES_PER_GB - 10), groupPlanRepository, planRepository))
      .resolves.toBeUndefined();
  });

  it('lanza PlanQuotaExceededError si la subida supera el límite', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxStorageGb: 1 });
    await expect(assertStorageQuotaNotExceeded(1, 11, makeDocumentRepo(0, BYTES_PER_GB - 10), groupPlanRepository, planRepository))
      .rejects.toThrow(PlanQuotaExceededError);
  });

  it('no revisa nada si el archivo no tiene tamaño', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxStorageGb: 1 });
    await assertStorageQuotaNotExceeded(1, 0, makeDocumentRepo(0), groupPlanRepository, planRepository);
    expect(groupPlanRepository.findActiveByGroupId).not.toHaveBeenCalled();
  });
});

describe('hasDocumentQuotaAvailable', () => {
  it('devuelve true sin plan', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos(null);
    expect(await hasDocumentQuotaAvailable(1, makeDocumentRepo(999), groupPlanRepository, planRepository)).toBe(true);
  });

  it('devuelve false al alcanzar el límite', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxDocuments: 5 });
    expect(await hasDocumentQuotaAvailable(1, makeDocumentRepo(5), groupPlanRepository, planRepository)).toBe(false);
  });

  it('devuelve true bajo el límite', async () => {
    const { groupPlanRepository, planRepository } = makePlanRepos({ maxDocuments: 5 });
    expect(await hasDocumentQuotaAvailable(1, makeDocumentRepo(4), groupPlanRepository, planRepository)).toBe(true);
  });
});
