import { BaseEntity } from '@shared/domain/base-entity';
import { UUID, DateUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface DocumentProps {
  id?: string;
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: Date;
  expirationDate?: Date;
  contractId: string;
  description?: string;
  documentUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Document extends BaseEntity {
  private constructor(
    id: string,
    private _documentTypeId: string,
    private _documentSubtypeId: string,
    private _name: string,
    private _issuedDate: Date,
    private _expirationDate: Date | null,
    private _contractId: string,
    private _description: string | undefined,
    private _documentUrl: string | undefined,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: DocumentProps): Document {
    const id = props.id || UUID.generate().toString();

    this.validateRequired(props);
    this.validateDates(props.issuedDate, props.expirationDate);

    return new Document(
      id,
      props.documentTypeId,
      props.documentSubtypeId,
      props.name.trim(),
      props.issuedDate,
      props.expirationDate || null,
      props.contractId,
      props.description?.trim(),
      props.documentUrl?.trim(),
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
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

    this._name = name.trim();
  }

  public updateDates(issuedDate: Date, expirationDate?: Date): void {
    if (!issuedDate) {
      throw new ValidationError('La fecha de emisión es requerida');
    }

    Document.validateDates(issuedDate, expirationDate);

    this._issuedDate = issuedDate;
    this._expirationDate = expirationDate || null;
  }

  public updateDescription(description?: string): void {
    if (description && description.trim().length > 1000) {
      throw new ValidationError('La descripción no puede exceder 1000 caracteres');
    }

    this._description = description?.trim();
  }

  public updateDocumentUrl(documentUrl?: string): void {
    this._documentUrl = documentUrl?.trim();
  }

  public updateDocumentTypeId(documentTypeId: string): void {
    if (!documentTypeId || documentTypeId.trim().length === 0) {
      throw new ValidationError('El ID del tipo de documento es requerido');
    }

    this._documentTypeId = documentTypeId;
  }

  public updateDocumentSubtypeId(documentSubtypeId: string): void {
    if (!documentSubtypeId || documentSubtypeId.trim().length === 0) {
      throw new ValidationError('El ID del subtipo de documento es requerido');
    }

    this._documentSubtypeId = documentSubtypeId;
  }

  public isExpired(): boolean {
    if (!this._expirationDate) return false;
    return DateUtils.isAfter(new Date(), this._expirationDate);
  }

  public daysUntilExpiration(): number | null {
    if (!this._expirationDate) return null;
    return DateUtils.daysBetween(new Date(), this._expirationDate);
  }

  // Getters
  get documentTypeId(): string {
    return this._documentTypeId;
  }

  get documentSubtypeId(): string {
    return this._documentSubtypeId;
  }

  get name(): string {
    return this._name;
  }

  get issuedDate(): Date {
    return this._issuedDate;
  }

  get expirationDate(): Date | null {
    return this._expirationDate;
  }

  get contractId(): string {
    return this._contractId;
  }

  get description(): string | undefined {
    return this._description;
  }

  get documentUrl(): string | undefined {
    return this._documentUrl;
  }

  public toJSON() {
    return {
      id: this.id,
      documentTypeId: this._documentTypeId,
      documentSubtypeId: this._documentSubtypeId,
      name: this._name,
      issuedDate: this._issuedDate,
      expirationDate: this._expirationDate,
      contractId: this._contractId,
      description: this._description,
      documentUrl: this._documentUrl,
      isExpired: this.isExpired(),
      daysUntilExpiration: this.daysUntilExpiration(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
