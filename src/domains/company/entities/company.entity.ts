import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface CompanyProps {
  id?: string;
  name: string;
  rut: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Company {
  id: string;
  name: string;
  rut: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props: CompanyProps) {
    Company.validateRequired(props);

    EntityUtils.assign(this as Company, props, {
      id: 'uuid',
      createdAt: 'datetime',
      updatedAt: 'datetime',
      deletedAt: 'dateNullable',
    });
  }

  public static create(props: CompanyProps): Company {
    return new Company(props);
  }

  private static validateRequired(props: CompanyProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('El nombre de la empresa es requerido');
    }

    if (props.name.trim().length < 2) {
      throw new ValidationError('El nombre de la empresa debe tener al menos 2 caracteres');
    }

    if (props.name.trim().length > 200) {
      throw new ValidationError('El nombre de la empresa no puede exceder 200 caracteres');
    }

    if (!props.rut || props.rut.trim().length === 0) {
      throw new ValidationError('El RUT de la empresa es requerido');
    }

    if (props.rut.trim().length < 8) {
      throw new ValidationError('El RUT de la empresa debe tener al menos 8 caracteres');
    }

    if (props.rut.trim().length > 12) {
      throw new ValidationError('El RUT de la empresa no puede exceder 12 caracteres');
    }

    if (props.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(props.contactEmail)) {
        throw new ValidationError('El correo del contacto comercial no es válido');
      }
    }
  }

  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('El nombre de la empresa es requerido');
    }

    if (name.trim().length < 2) {
      throw new ValidationError('El nombre de la empresa debe tener al menos 2 caracteres');
    }

    if (name.trim().length > 200) {
      throw new ValidationError('El nombre de la empresa no puede exceder 200 caracteres');
    }

    this.name = name.trim();
    this.updatedAt = new Date();
  }

  public updateRut(rut: string): void {
    if (!rut || rut.trim().length === 0) {
      throw new ValidationError('El RUT de la empresa es requerido');
    }

    if (rut.trim().length < 8) {
      throw new ValidationError('El RUT de la empresa debe tener al menos 8 caracteres');
    }

    if (rut.trim().length > 12) {
      throw new ValidationError('El RUT de la empresa no puede exceder 12 caracteres');
    }

    this.rut = rut.trim();
    this.updatedAt = new Date();
  }

  public updateAddress(address?: string): void {
    if (address && address.length > 300) {
      throw new ValidationError('La dirección no puede exceder 300 caracteres');
    }
    this.address = address?.trim();
    this.updatedAt = new Date();
  }

  public updateContactName(contactName?: string): void {
    if (contactName && contactName.length > 150) {
      throw new ValidationError('El nombre del contacto no puede exceder 150 caracteres');
    }
    this.contactName = contactName?.trim();
    this.updatedAt = new Date();
  }

  public updateContactPhone(contactPhone?: string): void {
    if (contactPhone && contactPhone.length > 20) {
      throw new ValidationError('El teléfono del contacto no puede exceder 20 caracteres');
    }
    this.contactPhone = contactPhone?.trim();
    this.updatedAt = new Date();
  }

  public updateContactEmail(contactEmail?: string): void {
    if (contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactEmail)) {
        throw new ValidationError('El correo del contacto comercial no es válido');
      }
      if (contactEmail.length > 100) {
        throw new ValidationError('El correo del contacto no puede exceder 100 caracteres');
      }
    }
    this.contactEmail = contactEmail?.trim();
    this.updatedAt = new Date();
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  public restore(): void {
    this.deletedAt = null;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      rut: this.rut,
      address: this.address,
      contactName: this.contactName,
      contactPhone: this.contactPhone,
      contactEmail: this.contactEmail,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
