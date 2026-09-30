import { describe, it, expect, mock } from 'bun:test';
import { SyncFeaturesUseCase } from './sync-features.use-case';
import { FeatureCategory, FeatureCategoryProps } from '../entities/feature-category.entity';
import { Feature, FeatureProps } from '../entities/feature.entity';
import { FeatureCategoryRepository } from '../repositories/feature-category.repository';
import { FeatureRepository } from '../repositories/feature.repository';

describe('SyncFeaturesUseCase', () => {
  it('crea o actualiza cada categoría y sus funcionalidades', async () => {
    const categoryRepo = {
      upsertByKey: mock((props: FeatureCategoryProps) => Promise.resolve(new FeatureCategory({ ...props, id: `cat-${props.key}` }))),
    } as unknown as FeatureCategoryRepository;
    const featureRepo = {
      upsertByKey: mock((props: FeatureProps) => Promise.resolve(new Feature(props))),
    } as unknown as FeatureRepository;

    await new SyncFeaturesUseCase(categoryRepo, featureRepo).execute([
      {
        key: 'firma-electronica',
        name: 'Firma electrónica',
        features: [
          { key: 'firma-electronica:simple', name: 'Firma simple' },
          { key: 'firma-electronica:reportes', name: 'Reportes' },
        ],
      },
    ]);

    expect(categoryRepo.upsertByKey).toHaveBeenCalledWith({ key: 'firma-electronica', name: 'Firma electrónica' });
    expect(featureRepo.upsertByKey).toHaveBeenCalledTimes(2);
    expect(featureRepo.upsertByKey).toHaveBeenCalledWith({
      categoryId: 'cat-firma-electronica',
      key: 'firma-electronica:simple',
      name: 'Firma simple',
    });
  });

  it('no hace nada si no hay definiciones', async () => {
    const categoryRepo = { upsertByKey: mock() } as unknown as FeatureCategoryRepository;
    const featureRepo = { upsertByKey: mock() } as unknown as FeatureRepository;

    await new SyncFeaturesUseCase(categoryRepo, featureRepo).execute([]);

    expect(categoryRepo.upsertByKey).not.toHaveBeenCalled();
    expect(featureRepo.upsertByKey).not.toHaveBeenCalled();
  });
});
