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
      throw new ValidationError('La categoría de la funcionalidad es obligatoria', 'categoryId');
    }
    if (!props.key?.trim()) {
      throw new ValidationError('La clave de la funcionalidad es obligatoria', 'key');
    }
    if (!props.name?.trim()) {
      throw new ValidationError('El nombre de la funcionalidad es obligatorio', 'name');
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
