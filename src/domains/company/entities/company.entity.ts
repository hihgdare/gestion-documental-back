import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface CompanyProps {
  id?: string;
  name: string;
  rut: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Company {
  id: string;
  name: string;
  rut: string;
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
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
