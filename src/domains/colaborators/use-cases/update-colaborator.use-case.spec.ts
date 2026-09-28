import { describe, it, expect, mock } from 'bun:test';
import { UpdateColaboratorUseCase } from './update-colaborator.use-case';
import { Colaborator } from '../entities/colaborator.entity';
import { ColaboratorRepository } from '../repositories/colaborator.repository';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { GroupPlan } from '@domains/plan/entities/group-plan.entity';
import { Plan } from '@domains/plan/entities/plan.entity';
import { PlanQuotaExceededError } from '@shared/domain/errors';

function makeUseCase(colaborator: Colaborator) {
  const colaboratorRepository = {
    findById: mock(() => Promise.resolve(colaborator)),
    countActiveByGroupId: mock(() => Promise.resolve(10)),
    update: mock((c: Colaborator) => Promise.resolve(c)),
  } as unknown as ColaboratorRepository;
  const groupPlanRepository = {
    findActiveByGroupId: mock(() => Promise.resolve(new GroupPlan({ groupId: 1, planId: 'plan-id' }))),
  } as unknown as GroupPlanRepository;
  const planRepository = {
    findById: mock(() => Promise.resolve(new Plan({ name: 'Básico', maxActiveColaborators: 10 }))),
  } as unknown as PlanRepository;

  const useCase = new UpdateColaboratorUseCase(colaboratorRepository, {} as GroupRepository, groupPlanRepository, planRepository);
  return { useCase, colaboratorRepository };
}

function makeColaborator(active: boolean): Colaborator {
  return { groupId: 1, isActive: () => active, activate: mock() } as unknown as Colaborator;
}

describe('UpdateColaboratorUseCase.activate', () => {
  it('no revisa la cuota si el colaborador ya está activo', async () => {
    const colaborator = makeColaborator(true);
    const { useCase, colaboratorRepository } = makeUseCase(colaborator);

    const result = await useCase.activate('colab-id');

    expect(result).toBe(colaborator);
    expect(colaboratorRepository.countActiveByGroupId).not.toHaveBeenCalled();
    expect(colaboratorRepository.update).not.toHaveBeenCalled();
  });

  it('lanza PlanQuotaExceededError al activar un colaborador inactivo con la cuota llena', async () => {
    const { useCase, colaboratorRepository } = makeUseCase(makeColaborator(false));

    await expect(useCase.activate('colab-id')).rejects.toThrow(PlanQuotaExceededError);
    expect(colaboratorRepository.update).not.toHaveBeenCalled();
  });
});
