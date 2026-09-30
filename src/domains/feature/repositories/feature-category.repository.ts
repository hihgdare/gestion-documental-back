import { FeatureCategory, FeatureCategoryProps } from '../entities/feature-category.entity';

export interface FeatureCategoryRepository {
  findAll(): Promise<FeatureCategory[]>;
  findByKey(key: string): Promise<FeatureCategory | null>;
  upsertByKey(props: FeatureCategoryProps): Promise<FeatureCategory>;
}
