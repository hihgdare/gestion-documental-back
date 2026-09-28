import { describe, it, expect, mock } from 'bun:test';
import { Request, Response } from 'express';
import { requireFeature } from './feature.middleware';
import { GetGroupFeaturesUseCase } from '@domains/plan/use-cases/get-group-features.use-case';
import { FeatureNotAvailableError } from '@shared/domain/errors';

const FEATURE_KEY = 'firma-electronica:simple';

function makeUseCase(featureKeys: string[]) {
  return {
    execute: mock(() => Promise.resolve({
      planId: null,
      planFeatureIds: [],
      overrides: [],
      effectiveFeatures: featureKeys.map((key) => ({ key, categoryId: 'cat', name: key, source: 'plan' as const })),
    })),
  } as unknown as GetGroupFeaturesUseCase;
}

function makeRequest(options: { rbac: boolean; groupId?: number }): Request {
  return {
    headers: { 'x-enable-rbac': options.rbac ? 'true' : 'false' },
    auth: { groupId: options.groupId },
  } as unknown as Request;
}

async function run(useCase: GetGroupFeaturesUseCase, req: Request) {
  const next = mock(() => undefined);
  await requireFeature(FEATURE_KEY, useCase)(req, {} as Response, next);
  return next;
}

describe('requireFeature', () => {
  it('deja pasar si RBAC está desactivado', async () => {
    const useCase = makeUseCase([]);
    const next = await run(useCase, makeRequest({ rbac: false, groupId: 1 }));
    expect(next).toHaveBeenCalledTimes(1);
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('deja pasar si la sesión no tiene grupo', async () => {
    const useCase = makeUseCase([]);
    const next = await run(useCase, makeRequest({ rbac: true }));
    expect(next).toHaveBeenCalledTimes(1);
    expect(useCase.execute).not.toHaveBeenCalled();
  });

  it('deja pasar si el grupo tiene la funcionalidad', async () => {
    const next = await run(makeUseCase([FEATURE_KEY]), makeRequest({ rbac: true, groupId: 1 }));
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('lanza FeatureNotAvailableError si el grupo no tiene la funcionalidad', async () => {
    const useCase = makeUseCase(['firma-electronica:reportes']);
    await expect(run(useCase, makeRequest({ rbac: true, groupId: 1 }))).rejects.toThrow(FeatureNotAvailableError);
  });
});
