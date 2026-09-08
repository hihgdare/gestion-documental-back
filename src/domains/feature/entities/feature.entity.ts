import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface FeatureProps {
  id?: string;
  categoryId: string;
  key: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeatureJson {
  id?: string;
  categoryId: string;
  key: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Feature {
  id?: string;
  categoryId: string;
  key: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: FeatureProps) {
    Feature.validate(props);
    EntityUtils.assign(this as Feature, props, {
      id: 'uuid',
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  private static validate(props: FeatureProps): void {
    if (!props.categoryId?.trim()) {
      throw new ValidationError('Feature category is required', 'categoryId');
    }
    if (!props.key?.trim()) {
      throw new ValidationError('Feature key is required', 'key');
    }
    if (!props.name?.trim()) {
      throw new ValidationError('Feature name is required', 'name');
    }
  }

  toJSON(): FeatureJson {
    return {
      id: this.id,
      categoryId: this.categoryId,
      key: this.key,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
