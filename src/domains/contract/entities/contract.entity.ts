import { EntityUtils } from '@shared/utils/common';
import { ContractStatus, ContractType, JornadaTrabajo } from '../value-objects/contract-enums';
import { ValidationError } from '@shared/domain/errors';
import { isValid, parseEnum } from '@shared/utils/objects';
import { DateTimeUtils, DateUtils } from '@shared/utils/date';

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
  endDate?: DateType,
  contractType?: string;
  jornadaTrabajo?: string;
  status?: string;
  dotacionPersonal?: number;
  dotacionVehiculos?: number;
  employeeId?: string;
  managerId?: string;
  createdAt?: DateType;
  updatedAt?: DateType;
  deletedAt?: DateType | null;
}

export interface CreateContractProps extends BaseContractProps {
  id?: string;
}

export type UpdateContractProps = Overlap<Partial<BaseContractProps>, {
  id: string;
}>;

export type ContractJson = Overlap<BaseContractProps, {
  id: string;
  startDate?: string;
  endDate?: string;
  duration?: number | null;
  isActive: boolean;
  isExpired: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}>


export class Contract {
  id: string;
  rutSociedad: string;
  nombreColaborador: string;
  startDate: Date;
  endDate: Date;
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
  employeeId?: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(props: CreateContractProps) {
    Contract.validateRequired(props);
    EntityUtils.assign(this as Contract, props, {
      id: 'uuid',
      startDate: 'date',
      endDate: 'date',
      contractType: (type?: string) => parseEnum(type, ContractType) ?? ContractType.CONSULTORIA,
      jornadaTrabajo: (jornada?: string) => parseEnum(jornada, JornadaTrabajo) ?? JornadaTrabajo.COMPLETA,
      status: (status?: string) => parseEnum(status, ContractStatus) ?? ContractStatus.DRAFT,
      dotacionPersonal: (dotacion?: number) => dotacion || 0,
      dotacionVehiculos: (dotacion?: number) => dotacion || 0,
      createdAt: 'datetime',
      updatedAt: 'datetime',
      deletedAt: 'datetimeNullable',
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

  public extendContract(endDate?: DateType): void {
    endDate = DateUtils.parse(endDate, true) ?? undefined;
    if (!endDate || !DateUtils.isAfter(endDate, this.startDate)) {
      throw new ValidationError('New end date must be after start date', 'endDate');
    }
    this.endDate = endDate;
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
      startDate: DateUtils.toString(this.startDate),
      endDate: DateUtils.toString(this.endDate),
      duration: this.getDuration(),
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      createdAt: DateTimeUtils.toString(this.createdAt),
      updatedAt: DateTimeUtils.toString(this.updatedAt),
      deletedAt: DateTimeUtils.toString(this.deletedAt, true),
    };
  }
}
