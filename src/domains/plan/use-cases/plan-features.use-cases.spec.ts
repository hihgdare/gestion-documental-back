import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { GetGroupFeaturesUseCase } from './get-group-features.use-case';
import { ReplaceGroupPlanUseCase } from './replace-group-plan.use-case';
import { AssignFeaturesToPlanUseCase } from './assign-features-to-plan.use-case';
import { SetGroupFeatureOverrideUseCase, RemoveGroupFeatureOverrideUseCase } from './set-group-feature-override.use-case';
import { GroupPlan } from '../entities/group-plan.entity';
import { Plan } from '../entities/plan.entity';
import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { Feature } from '@domains/feature/entities/feature.entity';
import { GroupFeatureOverride } from '@domains/feature/entities/group-feature-override.entity';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { GroupFeatureOverrideRepository } from '@domains/feature/repositories/group-feature-override.repository';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { NotFoundError, ValidationError } from '@shared/domain/errors';

const firma = new Feature({ id: 'f-firma', categoryId: 'cat', key: 'firma-electronica:simple', name: 'Firma' });
const reportes = new Feature({ id: 'f-reportes', categoryId: 'cat', key: 'firma-electronica:reportes', name: 'Reportes' });
const trazabilidad = new Feature({ id: 'f-traza', categoryId: 'cat', key: 'firma-electronica:trazabilidad', name: 'Trazabilidad' });
const catalog = [firma, reportes, trazabilidad];

function makeGroupPlanRepo(overrides: Partial<GroupPlanRepository> = {}): GroupPlanRepository {
  return {
    findById: mock(() => Promise.resolve(null)),
    findByGroupId: mock(() => Promise.resolve([])),
    findActiveByGroupId: mock(() => Promise.resolve(null)),
    deactivateOthers: mock(() => Promise.resolve()),
    existsByPlanId: mock(() => Promise.resolve(false)),
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
    setFeatures: mock(() => Promise.resolve(new Plan({ name: 'Básico' }))),
    ...overrides,
  };
}

function makeFeatureRepo(overrides: Partial<FeatureRepository> = {}): FeatureRepository {
  return {
    findAll: mock(() => Promise.resolve(catalog)),
    findIn: mock((ids: string[]) => Promise.resolve(catalog.filter((f) => ids.includes(f.id!)))),
    findByKey: mock(() => Promise.resolve(null)),
    upsertByKey: mock(() => Promise.resolve(firma)),
    ...overrides,
  };
}

function makeOverrideRepo(overrides: GroupFeatureOverride[] = []): GroupFeatureOverrideRepository {
  return {
    findByGroupId: mock(() => Promise.resolve(overrides)),
    upsert: mock((groupId: number, featureId: string, granted: boolean) =>
      Promise.resolve(new GroupFeatureOverride({ groupId, featureId, granted }))),
    remove: mock(() => Promise.resolve()),
  };
}

function makeGroupRepo(group: unknown = { id: 1, name: 'Grupo' }): GroupRepository {
  return { findById: mock(() => Promise.resolve(group)) } as unknown as GroupRepository;
}

const planWithFirma = new Plan({ id: 'plan-id', name: 'Básico', features: [firma.toJSON()] });
const activeGroupPlan = new GroupPlan({ id: 'gp-id', groupId: 1, planId: 'plan-id' });

// --- GetGroupFeaturesUseCase ---
describe('GetGroupFeaturesUseCase', () => {
  const makeUseCase = (options: { withPlan: boolean; overrides?: GroupFeatureOverride[] }) =>
    new GetGroupFeaturesUseCase(
      makeGroupPlanRepo({ findActiveByGroupId: mock(() => Promise.resolve(options.withPlan ? activeGroupPlan : null)) }),
      makePlanRepo({ findById: mock(() => Promise.resolve(planWithFirma)) }),
      makeOverrideRepo(options.overrides),
      makeFeatureRepo(),
    );

  const keysOf = (features: { key: string }[]) => features.map((f) => f.key).sort();

  it('devuelve las funcionalidades del plan activo', async () => {
    const result = await makeUseCase({ withPlan: true }).execute(1);
    expect(result.planId).toBe('plan-id');
    expect(result.planFeatureIds).toEqual(['f-firma']);
    expect(keysOf(result.effectiveFeatures)).toEqual(['firma-electronica:simple']);
  });

  it('agrega las funcionalidades otorgadas y quita las revocadas por override', async () => {
    const result = await makeUseCase({
      withPlan: true,
      overrides: [
        new GroupFeatureOverride({ groupId: 1, featureId: 'f-firma', granted: false }),
        new GroupFeatureOverride({ groupId: 1, featureId: 'f-reportes', granted: true }),
      ],
    }).execute(1);

    expect(keysOf(result.effectiveFeatures)).toEqual(['firma-electronica:reportes']);
    expect(result.effectiveFeatures[0].source).toBe('override');
  });

  it('otorga todo el catálogo a un grupo sin plan', async () => {
    const result = await makeUseCase({ withPlan: false }).execute(1);
    expect(result.planId).toBeNull();
    expect(result.planFeatureIds).toEqual([]);
    expect(keysOf(result.effectiveFeatures)).toEqual(keysOf(catalog));
  });

  it('respeta las revocaciones aunque el grupo no tenga plan', async () => {
    const result = await makeUseCase({
      withPlan: false,
      overrides: [new GroupFeatureOverride({ groupId: 1, featureId: 'f-traza', granted: false })],
    }).execute(1);
    expect(keysOf(result.effectiveFeatures)).toEqual(['firma-electronica:reportes', 'firma-electronica:simple']);
  });

  it('getAvailableFeatureKeys devuelve todo el catálogo si no hay grupo', async () => {
    const keys = await makeUseCase({ withPlan: true }).getAvailableFeatureKeys(undefined);
    expect(keys.sort()).toEqual(keysOf(catalog));
  });

  it('hasFeature cachea las funcionalidades del grupo hasta invalidar la caché', async () => {
    const groupPlanRepo = makeGroupPlanRepo({ findActiveByGroupId: mock(() => Promise.resolve(activeGroupPlan)) });
    const useCase = new GetGroupFeaturesUseCase(
      groupPlanRepo,
      makePlanRepo({ findById: mock(() => Promise.resolve(planWithFirma)) }),
      makeOverrideRepo(),
      makeFeatureRepo(),
    );

    expect(await useCase.hasFeature(1, 'firma-electronica:simple')).toBe(true);
    expect(await useCase.hasFeature(1, 'firma-electronica:reportes')).toBe(false);
    expect(groupPlanRepo.findActiveByGroupId).toHaveBeenCalledTimes(1);

    useCase.invalidateCache();
    await useCase.hasFeature(1, 'firma-electronica:simple');
    expect(groupPlanRepo.findActiveByGroupId).toHaveBeenCalledTimes(2);
  });

  it('getAvailableFeatureKeys devuelve las funcionalidades efectivas del grupo', async () => {
    const keys = await makeUseCase({ withPlan: true }).getAvailableFeatureKeys(1);
    expect(keys).toEqual(['firma-electronica:simple']);
  });
});

// --- ReplaceGroupPlanUseCase ---
describe('ReplaceGroupPlanUseCase', () => {
  let groupPlanRepo: GroupPlanRepository;
  let planRepo: PlanRepository;

  beforeEach(() => {
    groupPlanRepo = makeGroupPlanRepo();
    planRepo = makePlanRepo({ findById: mock(() => Promise.resolve(planWithFirma)) });
  });

  it('lanza ValidationError si el grupo no existe', async () => {
    const useCase = new ReplaceGroupPlanUseCase(groupPlanRepo, planRepo, makeGroupRepo(null));
    await expect(useCase.execute({ groupId: 99, planId: 'plan-id' })).rejects.toThrow(ValidationError);
  });

  it('lanza ValidationError si el plan no existe', async () => {
    planRepo.findById = mock(() => Promise.resolve(null));
    const useCase = new ReplaceGroupPlanUseCase(groupPlanRepo, planRepo, makeGroupRepo());
    await expect(useCase.execute({ groupId: 1, planId: 'missing' })).rejects.toThrow(ValidationError);
  });

  it('crea una asignación nueva y desactiva las demás cuando cambia el plan', async () => {
    groupPlanRepo.findActiveByGroupId = mock(() =>
      Promise.resolve(new GroupPlan({ id: 'old-gp', groupId: 1, planId: 'otro-plan' })));
    const useCase = new ReplaceGroupPlanUseCase(groupPlanRepo, planRepo, makeGroupRepo());

    const result = await useCase.execute({ groupId: 1, planId: 'plan-id' });

    expect(result.planId).toBe('plan-id');
    expect(groupPlanRepo.save).toHaveBeenCalledTimes(1);
    expect(groupPlanRepo.deactivateOthers).toHaveBeenCalledWith(1, result.id);
  });

  it('actualiza las fechas si el plan activo es el mismo', async () => {
    const current = new GroupPlan({ id: 'gp-id', groupId: 1, planId: 'plan-id' });
    groupPlanRepo.findActiveByGroupId = mock(() => Promise.resolve(current));
    const useCase = new ReplaceGroupPlanUseCase(groupPlanRepo, planRepo, makeGroupRepo());
    const endsAt = new Date('2030-01-01');

    const result = await useCase.execute({ groupId: 1, planId: 'plan-id', endsAt });

    expect(result.id).toBe('gp-id');
    expect(result.endsAt).toEqual(endsAt);
    expect(groupPlanRepo.save).not.toHaveBeenCalled();
    expect(groupPlanRepo.deactivateOthers).toHaveBeenCalledWith(1, 'gp-id');
  });
});

// --- AssignFeaturesToPlanUseCase ---
describe('AssignFeaturesToPlanUseCase', () => {
  it('lanza NotFoundError si el plan no existe', async () => {
    const useCase = new AssignFeaturesToPlanUseCase(makePlanRepo(), makeFeatureRepo());
    await expect(useCase.execute('missing', ['f-firma'])).rejects.toThrow(NotFoundError);
  });

  it('lanza ValidationError si alguna funcionalidad no existe', async () => {
    const useCase = new AssignFeaturesToPlanUseCase(
      makePlanRepo({ findById: mock(() => Promise.resolve(planWithFirma)) }),
      makeFeatureRepo(),
    );
    await expect(useCase.execute('plan-id', ['f-firma', 'no-existe'])).rejects.toThrow(ValidationError);
  });

  it('asigna las funcionalidades sin duplicados', async () => {
    const planRepo = makePlanRepo({ findById: mock(() => Promise.resolve(planWithFirma)) });
    const useCase = new AssignFeaturesToPlanUseCase(planRepo, makeFeatureRepo());

    await useCase.execute('plan-id', ['f-firma', 'f-firma', 'f-reportes']);

    expect(planRepo.setFeatures).toHaveBeenCalledWith('plan-id', ['f-firma', 'f-reportes']);
  });

  it('permite dejar el plan sin funcionalidades', async () => {
    const planRepo = makePlanRepo({ findById: mock(() => Promise.resolve(planWithFirma)) });
    const featureRepo = makeFeatureRepo();
    await new AssignFeaturesToPlanUseCase(planRepo, featureRepo).execute('plan-id', []);

    expect(featureRepo.findIn).not.toHaveBeenCalled();
    expect(planRepo.setFeatures).toHaveBeenCalledWith('plan-id', []);
  });
});

// --- Set/RemoveGroupFeatureOverrideUseCase ---
describe('SetGroupFeatureOverrideUseCase', () => {
  it('lanza NotFoundError si el grupo no existe', async () => {
    const useCase = new SetGroupFeatureOverrideUseCase(makeOverrideRepo(), makeFeatureRepo(), makeGroupRepo(null));
    await expect(useCase.execute(99, 'f-firma', true)).rejects.toThrow(NotFoundError);
  });

  it('lanza NotFoundError si la funcionalidad no existe', async () => {
    const useCase = new SetGroupFeatureOverrideUseCase(makeOverrideRepo(), makeFeatureRepo(), makeGroupRepo());
    await expect(useCase.execute(1, 'no-existe', true)).rejects.toThrow(NotFoundError);
  });

  it('guarda el override', async () => {
    const overrideRepo = makeOverrideRepo();
    const useCase = new SetGroupFeatureOverrideUseCase(overrideRepo, makeFeatureRepo(), makeGroupRepo());

    const result = await useCase.execute(1, 'f-firma', false);

    expect(overrideRepo.upsert).toHaveBeenCalledWith(1, 'f-firma', false);
    expect(result.granted).toBe(false);
  });
});

describe('RemoveGroupFeatureOverrideUseCase', () => {
  it('elimina el override del grupo', async () => {
    const overrideRepo = makeOverrideRepo();
    await new RemoveGroupFeatureOverrideUseCase(overrideRepo).execute(1, 'f-firma');
    expect(overrideRepo.remove).toHaveBeenCalledWith(1, 'f-firma');
  });
});
