import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';
import { DateTimeUtils, DateUtils } from '@shared/utils/date';
import { parseEnum } from '@shared/utils/objects';
import { DocumentStatus } from '../value-objects/document-enums';

export interface DocumentProps {
  id?: string;
  documentTypeId: string;
  documentSubtypeId: string;
  documentTypeName?: string;
  documentSubtypeName?: string;
  name: string;
  issuedDate: Date;
  expirationDate?: Date | null;
  contractId?: string | null;
  contractNumber?: string;
  contractProjectName?: string;
  description?: string;
  documentUrl?: string;
  status?: string;
  createdBy?: string;
  comment?: string | null;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Document {
  id: string;
  documentTypeId: string;
  documentSubtypeId: string;
  documentTypeName?: string;
  documentSubtypeName?: string;
  name: string;
  issuedDate: Date;
  expirationDate: Date | null;
  contractId: string | null;
  contractNumber?: string;
  contractProjectName?: string;
  description?: string;
  documentUrl?: string;
  status: DocumentStatus;
  createdBy: string | null;
  comment: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: DocumentProps) {
    Document.validateRequired(props);
    Document.validateDates(props.issuedDate, props.expirationDate || undefined);

    EntityUtils.assign(this as Document, props, {
      id: 'uuid',
      issuedDate: 'date',
      expirationDate: 'dateNullable',
      contractId: (contractId?: string | null) => contractId || null,
      status: (status?: string) => parseEnum(status, DocumentStatus) ?? DocumentStatus.DRAFT,
      createdBy: (createdBy?: string) => createdBy || null,
      comment: (comment?: string | null) => comment || null,
      deletedAt: 'dateNullable',
      deletedBy: (deletedBy?: string | null) => deletedBy || null,
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  public static create(props: DocumentProps): Document {
    return new Document(props);
  }

  private static validateRequired(props: DocumentProps): void {
    if (!props.documentTypeId || props.documentTypeId.trim().length === 0) {
      throw new ValidationError('El ID del tipo de documento es requerido');
    }

    if (!props.documentSubtypeId || props.documentSubtypeId.trim().length === 0) {
      throw new ValidationError('El ID del subtipo de documento es requerido');
    }

    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('El nombre del documento es requerido');
    }

    if (props.name.trim().length < 2) {
      throw new ValidationError('El nombre del documento debe tener al menos 2 caracteres');
    }

    if (props.name.trim().length > 255) {
      throw new ValidationError('El nombre del documento no puede exceder 255 caracteres');
    }

    if (!props.issuedDate) {
      throw new ValidationError('La fecha de emisión es requerida');
    }

    if (props.description && props.description.trim().length > 1000) {
      throw new ValidationError('La descripción no puede exceder 1000 caracteres');
    }

    if (props.comment && props.comment.trim().length > 1000) {
      throw new ValidationError('El comentario no puede exceder 1000 caracteres');
    }
  }

  private static validateDates(issuedDate: Date, expirationDate?: Date): void {
    if (expirationDate && expirationDate <= issuedDate) {
      throw new ValidationError('La fecha de vencimiento debe ser posterior a la fecha de emisión');
    }
  }

  // Business methods
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('El nombre del documento es requerido');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('El nombre del documento debe tener al menos 2 caracteres');
    }

    if (name.trim().length > 255) {
      throw new ValidationError('El nombre del documento no puede exceder 255 caracteres');
    }

    this.name = name.trim();
    this.updatedAt = new Date();
  }

  public updateDates(issuedDate: Date, expirationDate?: Date): void {
    if (!issuedDate) {
      throw new ValidationError('La fecha de emisión es requerida');
    }

    Document.validateDates(issuedDate, expirationDate);

    this.issuedDate = issuedDate;
    this.expirationDate = expirationDate || null;
    this.updatedAt = new Date();
  }

  public updateDescription(description?: string): void {
    if (description && description.trim().length > 1000) {
      throw new ValidationError('La descripción no puede exceder 1000 caracteres');
    }

    this.description = description?.trim();
    this.updatedAt = new Date();
  }

  public updateDocumentUrl(documentUrl?: string): void {
    this.documentUrl = documentUrl?.trim();
    this.updatedAt = new Date();
  }

  public updateDocumentTypeId(documentTypeId: string): void {
    if (!documentTypeId || documentTypeId.trim().length === 0) {
      throw new ValidationError('El ID del tipo de documento es requerido');
    }

    this.documentTypeId = documentTypeId;
    this.updatedAt = new Date();
  }

  public updateDocumentSubtypeId(documentSubtypeId: string): void {
    if (!documentSubtypeId || documentSubtypeId.trim().length === 0) {
      throw new ValidationError('El ID del subtipo de documento es requerido');
    }

    this.documentSubtypeId = documentSubtypeId;
    this.updatedAt = new Date();
  }

  public updateContractId(contractId?: string | null): void {
    this.contractId = contractId || null;
    this.updatedAt = new Date();
  }

  public updateStatus(status: DocumentStatus, comment?: string | null): void {
    this.status = status;
    this.comment = comment ? comment.trim() : null;
    this.updatedAt = new Date();
  }

  public updateComment(comment: string | null): void {
    if (comment && comment.trim().length > 1000) {
      throw new ValidationError('El comentario no puede exceder 1000 caracteres');
    }

    this.comment = comment ? comment.trim() : null;
    this.updatedAt = new Date();
  }

  public softDelete(deletedBy: string): void {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.updatedAt = new Date();
  }

  public restore(): void {
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedAt = new Date();
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public isExpired(): boolean {
    if (!this.expirationDate) return false;
    return DateUtils.isAfter(new Date(), this.expirationDate);
  }

  public daysUntilExpiration(): number | null {
    if (!this.expirationDate) return null;
    return DateUtils.daysBetween(new Date(), this.expirationDate);
  }

  public sendToReview(): void {
    if (this.status !== DocumentStatus.DRAFT) {
      throw new ValidationError('Solo los documentos en borrador pueden enviarse a revisión');
    }
    this.status = DocumentStatus.IN_REVIEW;
    this.comment = null;
    this.updatedAt = new Date();
  }

  public approve(): void {
    if (this.status !== DocumentStatus.IN_REVIEW) {
      throw new ValidationError('Solo los documentos en revisión pueden aprobarse');
    }
    this.status = DocumentStatus.APPROVED;
    this.comment = null;
    this.updatedAt = new Date();
  }

  public reject(): void {
    if (this.status !== DocumentStatus.IN_REVIEW) {
      throw new ValidationError('Solo los documentos en revisión pueden rechazarse');
    }
    this.status = DocumentStatus.REJECTED;
    this.comment = null;
    this.updatedAt = new Date();
  }

  public rejectWithComments(comment: string): void {
    if (this.status !== DocumentStatus.IN_REVIEW) {
      throw new ValidationError('Solo los documentos en revisión pueden rechazarse');
    }
    this.status = DocumentStatus.REJECTED_WITH_COMMENTS;
    this.comment = comment;
    this.updatedAt = new Date();
  }

  public setToDraft(): void {
    this.status = DocumentStatus.DRAFT;
    this.comment = null;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      documentTypeId: this.documentTypeId,
      documentSubtypeId: this.documentSubtypeId,
      name: this.name,
      issuedDate: DateUtils.toString(this.issuedDate),
      expirationDate: DateUtils.toString(this.expirationDate, true),
      contractId: this.contractId,
      description: this.description,
      documentUrl: this.documentUrl,
      status: this.status,
      createdBy: this.createdBy,
      comment: this.comment,
      deletedAt: DateTimeUtils.toString(this.deletedAt),
      deletedBy: this.deletedBy,
      isDeleted: this.isDeleted(),
      isExpired: this.isExpired(),
      daysUntilExpiration: this.daysUntilExpiration(),
      createdAt: DateTimeUtils.toString(this.createdAt),
      updatedAt: DateTimeUtils.toString(this.updatedAt),
    };
  }
}
