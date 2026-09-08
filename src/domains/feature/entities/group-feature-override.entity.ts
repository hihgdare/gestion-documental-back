import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface GroupFeatureOverrideProps {
  id?: string;
  groupId: number;
  featureId: string;
  granted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupFeatureOverrideJson {
  id?: string;
  groupId: number;
  featureId: string;
  granted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GroupFeatureOverride {
  id?: string;
  groupId: number;
  featureId: string;
  granted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: GroupFeatureOverrideProps) {
    GroupFeatureOverride.validate(props);
    EntityUtils.assign(this as GroupFeatureOverride, props, {
      id: 'uuid',
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  private static validate(props: GroupFeatureOverrideProps): void {
    if (!props.groupId) {
      throw new ValidationError('Group ID is required', 'groupId');
    }
    if (!props.featureId?.trim()) {
      throw new ValidationError('Feature ID is required', 'featureId');
    }
    if (typeof props.granted !== 'boolean') {
      throw new ValidationError('Granted flag is required', 'granted');
    }
  }

  toJSON(): GroupFeatureOverrideJson {
    return {
      id: this.id,
      groupId: this.groupId,
      featureId: this.featureId,
      granted: this.granted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
