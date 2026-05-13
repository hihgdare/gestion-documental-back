import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AssignPlanToGroupUseCase } from './assign-plan-to-group.use-case';
import { GetGroupPlanUseCase, ListGroupPlansByGroupUseCase, GetActiveGroupPlanUseCase } from './get-group-plan.use-case';
import { UpdateGroupPlanUseCase, DeleteGroupPlanUseCase } from './update-group-plan.use-case';
import { GroupPlan } from '../entities/group-plan.entity';
import { Plan } from '../entities/plan.entity';
import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { ValidationError, NotFoundError } from '@shared/domain/errors';

// --- Mock factories ---
function makeGroupPlan(overrides: Partial<GroupPlan> = {}): GroupPlan {
  const gp = new GroupPlan({ groupId: 1, planId: 'plan-id' });
  Object.assign(gp, overrides);
  return gp;
}

function makeGroupPlanRepo(overrides: Partial<GroupPlanRepository> = {}): GroupPlanRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    findByGroupId: mock(() => Promise.resolve([])),
    findActiveByGroupId: mock(() => Promise.resolve(null)),
    save: mock((gp: GroupPlan) => Promise.resolve(gp)),
    update: mock((gp: GroupPlan) => Promise.resolve(gp)),
    delete: mock(() => Promise.resolve()),
    ...overrides,
  };
}

function makePlanRepo(overrides: Partial<PlanRepository> = {}): PlanRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    findAll: mock(() => Promise.resolve([])),
    existsByName: mock(() => Promise.resolve(false)),
    save: mock((p: Plan) => Promise.resolve(p)),
    update: mock((p: Plan) => Promise.resolve(p)),
    delete: mock(() => Promise.resolve()),
    ...overrides,
  };
}

function makeGroupRepo(overrides: Partial<GroupRepository> = {}): GroupRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    findAll: mock(() => Promise.resolve([])),
    findByName: mock(() => Promise.resolve(null)),
    findByUserId: mock(() => Promise.resolve(null)),
    existsByName: mock(() => Promise.resolve(false)),
    save: mock((g: any) => Promise.resolve(g)),
    update: mock((g: any) => Promise.resolve(g)),
    delete: mock(() => Promise.resolve()),
    addUserToGroup: mock(() => Promise.resolve()),
    removeUserFromGroup: mock(() => Promise.resolve()),
    findUsersByGroupId: mock(() => Promise.resolve(null)),
    ...overrides,
  };
}

const mockGroup = { id: 1, name: 'Grupo Test' } as any;
const mockPlan = new Plan({ name: 'Básico' });

// --- AssignPlanToGroupUseCase ---
describe('AssignPlanToGroupUseCase', () => {
  let groupPlanRepo: GroupPlanRepository;
  let planRepo: PlanRepository;
  let groupRepo: GroupRepository;
  let useCase: AssignPlanToGroupUseCase;

  beforeEach(() => {
    groupPlanRepo = makeGroupPlanRepo();
    planRepo = makePlanRepo({ findById: mock(() => Promise.resolve(mockPlan)) });
    groupRepo = makeGroupRepo({ findById: mock(() => Promise.resolve(mockGroup)) });
    useCase = new AssignPlanToGroupUseCase(groupPlanRepo, planRepo, groupRepo);
  });

  it('asigna un plan a un grupo correctamente', async () => {
    const result = await useCase.execute({ groupId: 1, planId: 'plan-id' });
    expect(result).toBeInstanceOf(GroupPlan);
    expect(result.groupId).toBe(1);
    expect(result.planId).toBe('plan-id');
    expect(result.isActive).toBe(true);
    expect(groupPlanRepo.save).toHaveBeenCalledTimes(1);
  });

  it('lanza ValidationError si el grupo no existe', async () => {
    groupRepo.findById = mock(() => Promise.resolve(null));
    expect(useCase.execute({ groupId: 99, planId: 'plan-id' })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si el plan no existe', async () => {
    planRepo.findById = mock(() => Promise.resolve(null));
    expect(useCase.execute({ groupId: 1, planId: 'missing' })).rejects.toThrow(ValidationError);
  });

  it('respeta la fecha de inicio si se proporciona', async () => {
    const startsAt = new Date('2026-01-01');
    const result = await useCase.execute({ groupId: 1, planId: 'plan-id', startsAt });
    expect(result.startsAt).toEqual(startsAt);
  });

  it('asigna endsAt nulo por defecto', async () => {
    const result = await useCase.execute({ groupId: 1, planId: 'plan-id' });
    expect(result.endsAt).toBeNull();
  });
});

// --- GetGroupPlanUseCase ---
describe('GetGroupPlanUseCase', () => {
  it('retorna el groupPlan si existe', async () => {
    const gp = makeGroupPlan({ id: 'gp-id' });
    const repo = makeGroupPlanRepo({ findById: mock(() => Promise.resolve(gp)) });
    const result = await new GetGroupPlanUseCase(repo).execute('gp-id');
    expect(result).toBe(gp);
  });

  it('lanza NotFoundError si no existe', async () => {
    expect(new GetGroupPlanUseCase(makeGroupPlanRepo()).execute('missing')).rejects.toThrow(NotFoundError);
  });
});

// --- ListGroupPlansByGroupUseCase ---
describe('ListGroupPlansByGroupUseCase', () => {
  it('retorna los planes del grupo', async () => {
    const gps = [makeGroupPlan(), makeGroupPlan()];
    const repo = makeGroupPlanRepo({ findByGroupId: mock(() => Promise.resolve(gps)) });
    const result = await new ListGroupPlansByGroupUseCase(repo).execute(1);
    expect(result).toHaveLength(2);
  });

  it('retorna lista vacía si el grupo no tiene planes', async () => {
    const result = await new ListGroupPlansByGroupUseCase(makeGroupPlanRepo()).execute(99);
    expect(result).toEqual([]);
  });
});

// --- GetActiveGroupPlanUseCase ---
describe('GetActiveGroupPlanUseCase', () => {
  it('retorna el plan activo del grupo', async () => {
    const gp = makeGroupPlan({ isActive: true });
    const repo = makeGroupPlanRepo({ findActiveByGroupId: mock(() => Promise.resolve(gp)) });
    const result = await new GetActiveGroupPlanUseCase(repo).execute(1);
    expect(result).toBe(gp);
  });

  it('retorna null si no hay plan activo', async () => {
    const result = await new GetActiveGroupPlanUseCase(makeGroupPlanRepo()).execute(1);
    expect(result).toBeNull();
  });
});

// --- UpdateGroupPlanUseCase ---
describe('UpdateGroupPlanUseCase', () => {
  let gp: GroupPlan;
  let repo: GroupPlanRepository;
  let useCase: UpdateGroupPlanUseCase;

  beforeEach(() => {
    gp = makeGroupPlan({ id: 'gp-id', isActive: true });
    repo = makeGroupPlanRepo({ findById: mock(() => Promise.resolve(gp)) });
    useCase = new UpdateGroupPlanUseCase(repo);
  });

  it('desactiva el plan del grupo', async () => {
    const result = await useCase.execute({ id: 'gp-id', isActive: false });
    expect(result.isActive).toBe(false);
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('actualiza la fecha de fin', async () => {
    const endsAt = new Date('2026-12-31');
    const result = await useCase.execute({ id: 'gp-id', endsAt });
    expect(result.endsAt).toEqual(endsAt);
  });

  it('permite establecer endsAt como null (sin expiración)', async () => {
    gp.endsAt = new Date('2026-06-01');
    const result = await useCase.execute({ id: 'gp-id', endsAt: null });
    expect(result.endsAt).toBeNull();
  });

  it('lanza NotFoundError si no existe', async () => {
    repo.findById = mock(() => Promise.resolve(null));
    expect(useCase.execute({ id: 'missing' })).rejects.toThrow(NotFoundError);
  });
});

// --- DeleteGroupPlanUseCase ---
describe('DeleteGroupPlanUseCase', () => {
  it('elimina el groupPlan si existe', async () => {
    const gp = makeGroupPlan({ id: 'gp-id' });
    const repo = makeGroupPlanRepo({ findById: mock(() => Promise.resolve(gp)) });
    await new DeleteGroupPlanUseCase(repo).execute('gp-id');
    expect(repo.delete).toHaveBeenCalledWith('gp-id');
  });

  it('lanza NotFoundError si no existe', async () => {
    expect(new DeleteGroupPlanUseCase(makeGroupPlanRepo()).execute('missing')).rejects.toThrow(NotFoundError);
  });
});
