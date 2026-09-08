import { FeatureCategoryRepository } from '../repositories/feature-category.repository';
import { FeatureRepository } from '../repositories/feature.repository';

export interface FeatureSeedDefinition {
  key: string;
  name: string;
  features: { key: string; name: string }[];
}

export class SyncFeaturesUseCase {
  constructor(
    private readonly featureCategoryRepository: FeatureCategoryRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(definitions: FeatureSeedDefinition[]): Promise<void> {
    for (const definition of definitions) {
      const category = await this.featureCategoryRepository.upsertByKey({
        key: definition.key,
        name: definition.name,
      });

      for (const feature of definition.features) {
        await this.featureRepository.upsertByKey({
          categoryId: category.id!,
          key: feature.key,
          name: feature.name,
        });
      }
    }
  }
}
