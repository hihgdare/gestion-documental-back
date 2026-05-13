import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { CreatePlanUseCase } from './create-plan.use-case';
import { GetPlanUseCase, ListPlansUseCase } from './get-plan.use-case';
import { UpdatePlanUseCase, DeletePlanUseCase } from './update-plan.use-case';
import { Plan } from '../entities/plan.entity';
import { PlanRepository } from '../repositories/plan.repository';
import { ValidationError, NotFoundError } from '@shared/domain/errors';

// --- Mock factory ---
function makePlan(overrides: Partial<Plan> = {}): Plan {
  return new Plan({ name: 'Básico', ...overrides });
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

// --- CreatePlanUseCase ---
describe('CreatePlanUseCase', () => {
  let repo: PlanRepository;
  let useCase: CreatePlanUseCase;

  beforeEach(() => {
    repo = makePlanRepo();
    useCase = new CreatePlanUseCase(repo);
  });

  it('crea un plan correctamente', async () => {
    const result = await useCase.execute({ name: 'Pro', maxActiveColaborators: 100 });
    expect(result).toBeInstanceOf(Plan);
    expect(result.name).toBe('Pro');
    expect(result.maxActiveColaborators).toBe(100);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('lanza ValidationError si ya existe un plan con ese nombre', async () => {
    repo.existsByName = mock(() => Promise.resolve(true));
    expect(useCase.execute({ name: 'Pro' })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si el nombre está vacío', async () => {
    expect(useCase.execute({ name: '' })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si el nombre supera 100 caracteres', async () => {
    expect(useCase.execute({ name: 'a'.repeat(101) })).rejects.toThrow(ValidationError);
  });

  it('crea un plan sin límites (null)', async () => {
    const result = await useCase.execute({ name: 'Ilimitado', maxDocuments: null });
    expect(result.maxDocuments).toBeNull();
  });
});

// --- GetPlanUseCase ---
describe('GetPlanUseCase', () => {
  it('retorna el plan si existe', async () => {
    const plan = makePlan();
    const repo = makePlanRepo({ findById: mock(() => Promise.resolve(plan)) });
    const result = await new GetPlanUseCase(repo).execute('some-id');
    expect(result).toBe(plan);
  });

  it('lanza NotFoundError si no existe', async () => {
    const repo = makePlanRepo();
    expect(new GetPlanUseCase(repo).execute('missing')).rejects.toThrow(NotFoundError);
  });
});

// --- ListPlansUseCase ---
describe('ListPlansUseCase', () => {
  it('retorna la lista de planes', async () => {
    const plans = [makePlan(), makePlan({ name: 'Pro' })];
    const repo = makePlanRepo({ findAll: mock(() => Promise.resolve(plans)) });
    const result = await new ListPlansUseCase(repo).execute();
    expect(result).toHaveLength(2);
  });

  it('retorna lista vacía si no hay planes', async () => {
    const result = await new ListPlansUseCase(makePlanRepo()).execute();
    expect(result).toEqual([]);
  });
});

// --- UpdatePlanUseCase ---
describe('UpdatePlanUseCase', () => {
  let plan: Plan;
  let repo: PlanRepository;
  let useCase: UpdatePlanUseCase;

  beforeEach(() => {
    plan = makePlan();
    plan.id = 'plan-id';
    repo = makePlanRepo({ findById: mock(() => Promise.resolve(plan)) });
    useCase = new UpdatePlanUseCase(repo);
  });

  it('actualiza el nombre si cambia', async () => {
    repo.existsByName = mock(() => Promise.resolve(false));
    const result = await useCase.execute({ id: 'plan-id', name: 'Premium' });
    expect(result.name).toBe('Premium');
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('no verifica duplicado si el nombre no cambia', async () => {
    await useCase.execute({ id: 'plan-id', name: 'Básico' });
    expect(repo.existsByName).not.toHaveBeenCalled();
  });

  it('lanza ValidationError si el nombre nuevo ya existe', async () => {
    repo.existsByName = mock(() => Promise.resolve(true));
    expect(useCase.execute({ id: 'plan-id', name: 'Otro' })).rejects.toThrow(ValidationError);
  });

  it('lanza NotFoundError si el plan no existe', async () => {
    repo.findById = mock(() => Promise.resolve(null));
    expect(useCase.execute({ id: 'missing' })).rejects.toThrow(NotFoundError);
  });

  it('actualiza solo los campos proporcionados', async () => {
    plan.maxDocuments = 500;
    await useCase.execute({ id: 'plan-id', maxActiveColaborators: 50 });
    expect(plan.maxActiveColaborators).toBe(50);
    expect(plan.maxDocuments).toBe(500); // sin cambio
  });
});

// --- DeletePlanUseCase ---
describe('DeletePlanUseCase', () => {
  it('elimina el plan si existe', async () => {
    const plan = makePlan();
    const repo = makePlanRepo({ findById: mock(() => Promise.resolve(plan)) });
    await new DeletePlanUseCase(repo).execute('plan-id');
    expect(repo.delete).toHaveBeenCalledWith('plan-id');
  });

  it('lanza NotFoundError si el plan no existe', async () => {
    expect(new DeletePlanUseCase(makePlanRepo()).execute('missing')).rejects.toThrow(NotFoundError);
  });
});
