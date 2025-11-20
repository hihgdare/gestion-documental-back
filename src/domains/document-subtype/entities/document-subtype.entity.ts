import { BaseEntity } from '@shared/domain/base-entity';
import { UUID } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface DocumentSubtypeProps {
  id?: string;
  name: string;
  documentTypeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentSubtype extends BaseEntity {
  private constructor(
    id: string,
    private _name: string,
    private _documentTypeId: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: DocumentSubtypeProps): DocumentSubtype {
    const id = props.id || UUID.generate().toString();

    this.validateRequired(props);

    return new DocumentSubtype(
      id,
      props.name.trim(),
      props.documentTypeId,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  private static validateRequired(props: DocumentSubtypeProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('El nombre del subtipo de documento es requerido');
    }

    if (props.name.trim().length < 2) {
      throw new ValidationError('El nombre del subtipo de documento debe tener al menos 2 caracteres');
    }

    if (props.name.trim().length > 100) {
      throw new ValidationError('El nombre del subtipo de documento no puede exceder 100 caracteres');
    }

    if (!props.documentTypeId || props.documentTypeId.trim().length === 0) {
      throw new ValidationError('El ID del tipo de documento es requerido');
    }
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('El nombre del subtipo de documento es requerido');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('El nombre del subtipo de documento debe tener al menos 2 caracteres');
    }

    if (name.trim().length > 100) {
      throw new ValidationError('El nombre del subtipo de documento no puede exceder 100 caracteres');
    }

    this._name = name.trim();
  }

  public updateDocumentTypeId(documentTypeId: string): void {
    if (!documentTypeId || documentTypeId.trim().length === 0) {
      throw new ValidationError('El ID del tipo de documento es requerido');
    }

    this._documentTypeId = documentTypeId;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get documentTypeId(): string {
    return this._documentTypeId;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this._name,
      documentTypeId: this._documentTypeId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
