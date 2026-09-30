import { GroupFeatureOverride } from '../entities/group-feature-override.entity';

export interface GroupFeatureOverrideRepository {
  findByGroupId(groupId: number): Promise<GroupFeatureOverride[]>;
  upsert(groupId: number, featureId: string, granted: boolean): Promise<GroupFeatureOverride>;
  remove(groupId: number, featureId: string): Promise<void>;
}
