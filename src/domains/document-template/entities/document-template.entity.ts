import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export type DocumentTemplateFieldType = 'text' | 'number' | 'date' | 'select' | 'textarea';

export interface DocumentTemplateField {
  id: string;
  name: string;
  label: string;
  fieldType: DocumentTemplateFieldType;
  required: boolean;
  order: number;
  options?: string[];
}

export interface DocumentTemplateProps {
  id?: string;
  code?: string;
  title: string;
  version?: number;
  documentDate: Date;
  description?: string;
  fileUrl?: string;
  groupId: number;
  fields?: DocumentTemplateField[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class DocumentTemplate {
  id: string;
  code: string;
  title: string;
  version: number;
  documentDate: Date;
  description: string | null;
  fileUrl: string | null;
  groupId: number;
  fields: DocumentTemplateField[];
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props: DocumentTemplateProps) {
    DocumentTemplate.validateRequired(props);

    EntityUtils.assign(this as DocumentTemplate, props, {
      id: 'uuid',
      version: (v?: number) => v ?? 1,
      documentDate: 'date',
      description: (v?: string) => v || null,
      fileUrl: (v?: string) => v || null,
      fields: (v?: DocumentTemplateField[]) => v ?? [],
      createdBy: (v?: string) => v || null,
      deletedAt: 'dateNullable',
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  public static create(props: DocumentTemplateProps): DocumentTemplate {
    return new DocumentTemplate(props);
  }

  private static validateRequired(props: DocumentTemplateProps): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new ValidationError('El título de la plantilla es requerido');
    }
    if (props.title.trim().length < 2) {
      throw new ValidationError('El título debe tener al menos 2 caracteres');
    }
    if (!props.documentDate) {
      throw new ValidationError('La fecha del documento es requerida');
    }
    if (!props.groupId) {
      throw new ValidationError('El ID del grupo es requerido');
    }
  }

  public createNewVersion(props: Partial<DocumentTemplateProps>): DocumentTemplateProps {
    return {
      title: props.title ?? this.title,
      version: this.version + 1,
      documentDate: props.documentDate ?? this.documentDate,
      description: props.description ?? this.description ?? undefined,
      fileUrl: props.fileUrl ?? this.fileUrl ?? undefined,
      groupId: this.groupId,
      fields: props.fields ?? this.fields,
      createdBy: props.createdBy ?? this.createdBy ?? undefined,
      code: this.code,
    };
  }

  public toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      code: this.code,
      title: this.title,
      version: this.version,
      documentDate: this.documentDate,
      description: this.description,
      fileUrl: this.fileUrl,
      groupId: this.groupId,
      fields: this.fields,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
