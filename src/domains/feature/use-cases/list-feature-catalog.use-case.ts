import { FeatureCategoryRepository } from '../repositories/feature-category.repository';
import { FeatureRepository } from '../repositories/feature.repository';
import { FeatureCategoryJson } from '../entities/feature-category.entity';
import { FeatureJson } from '../entities/feature.entity';

export interface FeatureCatalogCategory extends FeatureCategoryJson {
  features: FeatureJson[];
}

export class ListFeatureCatalogUseCase {
  constructor(
    private readonly featureCategoryRepository: FeatureCategoryRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(): Promise<FeatureCatalogCategory[]> {
    const [categories, features] = await Promise.all([
      this.featureCategoryRepository.findAll(),
      this.featureRepository.findAll(),
    ]);

    return categories.map((category) => ({
      ...category.toJSON(),
      features: features
        .filter((feature) => feature.categoryId === category.id)
        .map((feature) => feature.toJSON()),
    }));
  }
}
