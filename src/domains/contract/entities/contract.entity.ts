import { DateUtils, EntityUtils } from '@shared/utils/common';
import { ContractStatus, ContractType, JornadaTrabajo } from '../value-objects/contract-enums';
import { ValidationError } from '@shared/domain/errors';
import { isValid } from '@shared/utils/objects';

interface BaseContractProps {
  rutSociedad: string;
  nombreColaborador: string;
  administradorContratoMandante: string;
  administradorContratoEmpresa: string;
  rutAdministradorContrato: string;
  contractNumber: string;
  nombreMandante: string;
  division?: string;
  area?: string;
  descripcionServicio?: string;
  nombreProyecto?: string;
  startDate?: DateType,
  endDate?: DateType | null,
  contractType?: string;
  jornadaTrabajo?: string;
  status?: string;
  dotacionPersonal?: number;
  dotacionVehiculos?: number;
  createdAt?: DateType;
  updatedAt?: DateType;
  deletedAt?: DateType | null;
}

export interface CreateContractProps extends BaseContractProps {
  id?: string;
}

export interface UpdateContractProps extends CreateContractProps {
  id: string;
}

export type ContractJson = Overlap<BaseContractProps, {
  id: string;
  startDate?: string;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  duration?: number | null;
  isActive: boolean;
  isExpired: boolean;
}>


export class Contract {
  id: string;
  rutSociedad: string;
  nombreColaborador: string;
  startDate: Date;
  endDate: Date | null;
  contractType: ContractType;
  administradorContratoMandante: string;
  administradorContratoEmpresa: string;
  rutAdministradorContrato: string;
  contractNumber: string;
  nombreMandante: string;
  division?: string;
  area?: string;
  dotacionPersonal: number;
  dotacionVehiculos: number;
  descripcionServicio?: string;
  nombreProyecto?: string;
  jornadaTrabajo: JornadaTrabajo;
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props: CreateContractProps) {
    Contract.validateRequired(props);
    Contract.validateDates(props.startDate, props.endDate);
    EntityUtils.assign(this as Contract, props, {
      id: 'uuid',
      startDate: 'date',
      endDate: 'dateNullable',
      contractType: (type?: string) => isValid(type, ContractType) ? type : ContractType.CONSULTORIA,
      jornadaTrabajo: (jornada?: string) => isValid(jornada, JornadaTrabajo) ? jornada : JornadaTrabajo.COMPLETA,
      status: (status?: string) => isValid(status, ContractStatus) ? status : ContractStatus.DRAFT,
      dotacionPersonal: (dotacion?: number) => dotacion || 0,
      dotacionVehiculos: (dotacion?: number) => dotacion || 0,
      createdAt: 'date',
      updatedAt: 'date',
      deletedAt: 'dateNullable',
    });
  }

  private static validateRequired(props: CreateContractProps): void {
    if (!props.rutSociedad?.trim()) {
      throw new ValidationError('RUT de sociedad is required', 'rutSociedad');
    }
    if (!props.nombreColaborador?.trim()) {
      throw new ValidationError('Nombre colaborador is required', 'nombreColaborador');
    }
    if (!props.administradorContratoMandante?.trim()) {
      throw new ValidationError('Administrador contrato mandante is required', 'administradorContratoMandante');
    }
    if (!props.administradorContratoEmpresa?.trim()) {
      throw new ValidationError('Administrador contrato empresa is required', 'administradorContratoEmpresa');
    }
    if (!props.rutAdministradorContrato?.trim()) {
      throw new ValidationError('RUT administrador contrato is required', 'rutAdministradorContrato');
    }
    if (!props.contractNumber?.trim()) {
      throw new ValidationError('Contract number is required', 'contractNumber');
    }
    if (!props.nombreMandante?.trim()) {
      throw new ValidationError('Nombre mandante is required', 'nombreMandante');
    }
    if (props.contractType && !isValid(props.contractType, ContractType)) {
      throw new ValidationError('Invalid contract type', 'contractType');
    }
    if (props.jornadaTrabajo && !isValid(props.jornadaTrabajo, JornadaTrabajo)) {
      throw new ValidationError('Invalid jornadaTrabajo', 'jornadaTrabajo');
    }
    if (props.status && !isValid(props.status, ContractStatus)) {
      throw new ValidationError('Invalid contract status', 'status');
    }
  }

  private static validateDates(startDate?: DateType, endDate?: DateType | null): void {
    const now = new Date();

    if (DateUtils.isBefore(now, startDate)) {
      throw new ValidationError('Start date is required', 'startDate');
    }

    if (endDate && DateUtils.isBefore(endDate, startDate)) {
      throw new ValidationError('End date cannot be before start date', 'endDate');
    }
  }

  // Business methods
  public activate(): void {
    if (this.status === ContractStatus.TERMINATED) {
      throw new ValidationError('Cannot activate a terminated contract', 'status');
    }
    this.status = ContractStatus.ACTIVE;
  }

  public suspend(): void {
    if (this.status === ContractStatus.TERMINATED) {
      throw new ValidationError('Cannot suspend a terminated contract', 'status');
    }
    this.status = ContractStatus.SUSPENDED;
  }

  public terminate(): void {
    this.status = ContractStatus.TERMINATED;
  }

  public updateNombreColaborador(nombre: string): void {
    if (!nombre?.trim()) {
      throw new ValidationError('Nombre colaborador is required', 'nombreColaborador');
    }
    this.nombreColaborador = nombre.trim();
  }

  public updateDescripcionServicio(descripcion?: string): void {
    this.descripcionServicio = descripcion?.trim();
  }

  public updateDotaciones(personal: number, vehiculos: number): void {
    if (personal < 0 || vehiculos < 0) {
      throw new ValidationError('Dotaciones cannot be negative', 'dotaciones');
    }
    this.dotacionPersonal = personal;
    this.dotacionVehiculos = vehiculos;
  }

  public extendContract(newEndDate: Date): void {
    if (DateUtils.isBefore(newEndDate, this.startDate)) {
      throw new ValidationError('New end date cannot be before start date', 'endDate');
    }
    this.endDate = newEndDate;
  }

  public isActive(): boolean {
    return this.status === ContractStatus.ACTIVE;
  }

  public isExpired(): boolean {
    if (!this.endDate || !(this.endDate instanceof Date)) return false;
    return DateUtils.isAfter(new Date(), this.endDate);
  }

  public getDuration(): number | null {
    if (!this.endDate || !(this.endDate instanceof Date)) return null;
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }

  public toJSON(): ContractJson {
    return {
      id: this.id,
      rutSociedad: this.rutSociedad,
      nombreColaborador: this.nombreColaborador,
      administradorContratoMandante: this.administradorContratoMandante,
      administradorContratoEmpresa: this.administradorContratoEmpresa,
      rutAdministradorContrato: this.rutAdministradorContrato,
      contractNumber: this.contractNumber,
      nombreMandante: this.nombreMandante,
      division: this.division,
      area: this.area,
      descripcionServicio: this.descripcionServicio,
      nombreProyecto: this.nombreProyecto,
      contractType: this.contractType,
      jornadaTrabajo: this.jornadaTrabajo,
      status: this.status,
      dotacionPersonal: this.dotacionPersonal,
      dotacionVehiculos: this.dotacionVehiculos,
      startDate: this.startDate?.toISOString(),
      endDate: this.endDate?.toISOString() ?? null,
      duration: this.getDuration(),
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }
}
