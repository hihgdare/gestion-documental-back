import { GroupFeatureOverrideRepository } from '@domains/feature/repositories/group-feature-override.repository';
import { GroupFeatureOverride } from '@domains/feature/entities/group-feature-override.entity';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { NotFoundError } from '@shared/domain/errors';

export class SetGroupFeatureOverrideUseCase {
  constructor(
    private readonly groupFeatureOverrideRepository: GroupFeatureOverrideRepository,
    private readonly featureRepository: FeatureRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(groupId: number, featureId: string, granted: boolean): Promise<GroupFeatureOverride> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundError('Group', groupId.toString(), 'El grupo no existe');
    }

    const feature = await this.featureRepository.findIn([featureId]);
    if (feature.length === 0) {
      throw new NotFoundError('Feature', featureId, 'La funcionalidad no existe');
    }

    return this.groupFeatureOverrideRepository.upsert(groupId, featureId, granted);
  }
}

export class RemoveGroupFeatureOverrideUseCase {
  constructor(private readonly groupFeatureOverrideRepository: GroupFeatureOverrideRepository) {}

  async execute(groupId: number, featureId: string): Promise<void> {
    await this.groupFeatureOverrideRepository.remove(groupId, featureId);
  }
}
