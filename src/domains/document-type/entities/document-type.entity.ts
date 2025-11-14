import { BaseEntity } from '@shared/domain/base-entity';
import { UUID } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface DocumentTypeProps {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentType extends BaseEntity {
  private constructor(
    id: string,
    private _name: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: DocumentTypeProps): DocumentType {
    const id = props.id || UUID.generate().toString();

    this.validateRequired(props);

    return new DocumentType(
      id,
      props.name.trim(),
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  private static validateRequired(props: DocumentTypeProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('El nombre del tipo de documento es requerido');
    }

    if (props.name.trim().length < 2) {
      throw new ValidationError('El nombre del tipo de documento debe tener al menos 2 caracteres');
    }

    if (props.name.trim().length > 100) {
      throw new ValidationError('El nombre del tipo de documento no puede exceder 100 caracteres');
    }
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('El nombre del tipo de documento es requerido');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('El nombre del tipo de documento debe tener al menos 2 caracteres');
    }

    if (name.trim().length > 100) {
      throw new ValidationError('El nombre del tipo de documento no puede exceder 100 caracteres');
    }

    this._name = name.trim();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this._name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
