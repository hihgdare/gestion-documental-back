import { Feature, FeatureProps } from '../entities/feature.entity';

export interface FeatureRepository {
  findAll(): Promise<Feature[]>;
  findIn(ids: string[]): Promise<Feature[]>;
  findByKey(key: string): Promise<Feature | null>;
  upsertByKey(props: FeatureProps): Promise<Feature>;
}
