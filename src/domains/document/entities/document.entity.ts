import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';
import { DateTimeUtils, DateUtils } from '@shared/utils/date';

export interface DocumentProps {
  id?: string;
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: Date;
  expirationDate?: Date | null;
  contractId: string;
  description?: string;
  documentUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Document {
  id: string;
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: Date;
  expirationDate: Date | null;
  contractId: string;
  description?: string;
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: DocumentProps) {
    Document.validateRequired(props);
    Document.validateDates(props.issuedDate, props.expirationDate || undefined);
    
    EntityUtils.assign(this as Document, props, {
      id: 'uuid',
      issuedDate: 'date',
      expirationDate: 'dateNullable',
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

    if (!props.contractId || props.contractId.trim().length === 0) {
      throw new ValidationError('El ID del contrato es requerido');
    }

    if (props.description && props.description.trim().length > 1000) {
      throw new ValidationError('La descripción no puede exceder 1000 caracteres');
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

  public isExpired(): boolean {
    if (!this.expirationDate) return false;
    return DateUtils.isAfter(new Date(), this.expirationDate);
  }

  public daysUntilExpiration(): number | null {
    if (!this.expirationDate) return null;
    return DateUtils.daysBetween(new Date(), this.expirationDate);
  }

  public toJSON() {
    return {
      id: this.id,
      documentTypeId: this.documentTypeId,
      documentSubtypeId: this.documentSubtypeId,
      name: this.name,
      issuedDate: DateUtils.toString(this.issuedDate),
      expirationDate: DateUtils.toString(this.expirationDate),
      contractId: this.contractId,
      description: this.description,
      documentUrl: this.documentUrl,
      isExpired: this.isExpired(),
      daysUntilExpiration: this.daysUntilExpiration(),
      createdAt: DateTimeUtils.toString(this.createdAt),
      updatedAt: DateTimeUtils.toString(this.updatedAt),
    };
  }
}
