import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface DocumentTemplateProps {
  id?: string;
  name: string;
  description?: string | null;
  documentTypeId: string;
  documentSubtypeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentTemplate {
  id: string;
  name: string;
  description?: string | null;
  documentTypeId: string;
  documentSubtypeId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: DocumentTemplateProps) {
    DocumentTemplate.validateRequired(props);

    EntityUtils.assign(this as DocumentTemplate, props, {
      id: 'uuid',
      createdAt: 'date',
      updatedAt: 'date',
      description: (d?: string | null) => d || null,
    });
  }

  public static create(props: DocumentTemplateProps): DocumentTemplate {
    return new DocumentTemplate(props);
  }

  private static validateRequired(props: DocumentTemplateProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('El nombre de la plantilla es requerido', 'name');
    }

    if (props.name.trim().length < 2) {
      throw new ValidationError('El nombre de la plantilla debe tener al menos 2 caracteres', 'name');
    }

    if (props.name.trim().length > 255) {
      throw new ValidationError('El nombre de la plantilla no puede exceder 255 caracteres', 'name');
    }

    if (!props.documentTypeId || props.documentTypeId.trim().length === 0) {
      throw new ValidationError('El ID del tipo de documento es requerido', 'documentTypeId');
    }

    if (!props.documentSubtypeId || props.documentSubtypeId.trim().length === 0) {
      throw new ValidationError('El ID del subtipo de documento es requerido', 'documentSubtypeId');
    }
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) throw new ValidationError('El nombre de la plantilla es requerido', 'name');
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  public updateDescription(description?: string | null): void {
    this.description = description ?? null;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      documentTypeId: this.documentTypeId,
      documentSubtypeId: this.documentSubtypeId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
