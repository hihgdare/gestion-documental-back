import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface FeatureCategoryProps {
  id?: string;
  key: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FeatureCategoryJson {
  id?: string;
  key: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FeatureCategory {
  id?: string;
  key: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: FeatureCategoryProps) {
    FeatureCategory.validate(props);
    EntityUtils.assign(this as FeatureCategory, props, {
      id: 'uuid',
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  private static validate(props: FeatureCategoryProps): void {
    if (!props.key?.trim()) {
      throw new ValidationError('La clave de la categoría es obligatoria', 'key');
    }
    if (!props.name?.trim()) {
      throw new ValidationError('El nombre de la categoría es obligatorio', 'name');
    }
  }

  toJSON(): FeatureCategoryJson {
    return {
      id: this.id,
      key: this.key,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
