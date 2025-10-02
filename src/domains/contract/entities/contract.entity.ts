import { BaseEntity } from '@shared/domain/base-entity';
import { UUID, DateUtils } from '@shared/utils/common';
import { ContractStatus, ContractType, JornadaTrabajo } from '../value-objects/contract-enums';
import { ValidationError } from '@shared/domain/errors';

export interface ContractProps {
  id?: string;
  rutSociedad: string;
  nombreColaborador: string;
  startDate: Date;
  endDate?: Date;
  contractType: ContractType;
  administradorContratoMandante: string;
  administradorContratoEmpresa: string;
  rutAdministradorContrato: string;
  contractNumber: string;
  nombreMandante: string;
  division?: string;
  area?: string;
  dotacionPersonal?: number;
  dotacionVehiculos?: number;
  descripcionServicio?: string;
  nombreProyecto?: string;
  jornadaTrabajo: JornadaTrabajo;
  status?: ContractStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Contract extends BaseEntity {
  private constructor(
    id: string,
    private _rutSociedad: string,
    private _nombreColaborador: string,
    private _startDate: Date,
    private _endDate: Date | null,
    private _contractType: ContractType,
    private _administradorContratoMandante: string,
    private _administradorContratoEmpresa: string,
    private _rutAdministradorContrato: string,
    private _contractNumber: string,
    private _nombreMandante: string,
    private _division: string | undefined,
    private _area: string | undefined,
    private _dotacionPersonal: number,
    private _dotacionVehiculos: number,
    private _descripcionServicio: string | undefined,
    private _nombreProyecto: string | undefined,
    private _jornadaTrabajo: JornadaTrabajo,
    private _status: ContractStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: ContractProps): Contract {
    const id = props.id || UUID.generate().toString();
    const status = props.status || ContractStatus.DRAFT;
    
    this.validateRequired(props);
    this.validateDates(props.startDate, props.endDate);
    
    return new Contract(
      id,
      props.rutSociedad.trim(),
      props.nombreColaborador.trim(),
      props.startDate,
      props.endDate || null,
      props.contractType,
      props.administradorContratoMandante.trim(),
      props.administradorContratoEmpresa.trim(),
      props.rutAdministradorContrato.trim(),
      props.contractNumber.trim(),
      props.nombreMandante.trim(),
      props.division?.trim(),
      props.area?.trim(),
      props.dotacionPersonal || 0,
      props.dotacionVehiculos || 0,
      props.descripcionServicio?.trim(),
      props.nombreProyecto?.trim(),
      props.jornadaTrabajo,
      status,
      props.createdAt || new Date(),
      props.updatedAt || new Date()
    );
  }

  public static fromPersistence(props: ContractProps): Contract {
    const status = props.status || ContractStatus.DRAFT;
    
    return new Contract(
      props.id!,
      props.rutSociedad,
      props.nombreColaborador,
      props.startDate,
      props.endDate || null,
      props.contractType,
      props.administradorContratoMandante,
      props.administradorContratoEmpresa,
      props.rutAdministradorContrato,
      props.contractNumber,
      props.nombreMandante,
      props.division,
      props.area,
      props.dotacionPersonal || 0,
      props.dotacionVehiculos || 0,
      props.descripcionServicio,
      props.nombreProyecto,
      props.jornadaTrabajo,
      status,
      props.createdAt!,
      props.updatedAt!
    );
  }

  private static validateRequired(props: ContractProps): void {
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
    if (!props.startDate) {
      throw new ValidationError('Start date is required', 'startDate');
    }
  }

  private static validateDates(startDate: Date, endDate?: Date): void {
    const now = new Date();
    
    if (DateUtils.isBefore(startDate, now)) {
      // Allow past start dates for existing contracts
    }
    
    if (endDate && DateUtils.isBefore(endDate, startDate)) {
      throw new ValidationError('End date cannot be before start date', 'endDate');
    }
  }

  // Getters
  public get rutSociedad(): string {
    return this._rutSociedad;
  }

  public get nombreColaborador(): string {
    return this._nombreColaborador;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date | null {
    return this._endDate;
  }

  public get contractType(): ContractType {
    return this._contractType;
  }

  public get administradorContratoMandante(): string {
    return this._administradorContratoMandante;
  }

  public get administradorContratoEmpresa(): string {
    return this._administradorContratoEmpresa;
  }

  public get rutAdministradorContrato(): string {
    return this._rutAdministradorContrato;
  }

  public get contractNumber(): string {
    return this._contractNumber;
  }

  public get nombreMandante(): string {
    return this._nombreMandante;
  }

  public get division(): string | undefined {
    return this._division;
  }

  public get area(): string | undefined {
    return this._area;
  }

  public get dotacionPersonal(): number {
    return this._dotacionPersonal;
  }

  public get dotacionVehiculos(): number {
    return this._dotacionVehiculos;
  }

  public get descripcionServicio(): string | undefined {
    return this._descripcionServicio;
  }

  public get nombreProyecto(): string | undefined {
    return this._nombreProyecto;
  }

  public get jornadaTrabajo(): JornadaTrabajo {
    return this._jornadaTrabajo;
  }

  public get status(): ContractStatus {
    return this._status;
  }

  // Business methods
  public activate(): void {
    if (this._status === ContractStatus.TERMINATED) {
      throw new ValidationError('Cannot activate a terminated contract', 'status');
    }
    this._status = ContractStatus.ACTIVE;
  }

  public suspend(): void {
    if (this._status === ContractStatus.TERMINATED) {
      throw new ValidationError('Cannot suspend a terminated contract', 'status');
    }
    this._status = ContractStatus.SUSPENDED;
  }

  public terminate(): void {
    this._status = ContractStatus.TERMINATED;
  }

  public updateNombreColaborador(nombre: string): void {
    if (!nombre?.trim()) {
      throw new ValidationError('Nombre colaborador is required', 'nombreColaborador');
    }
    this._nombreColaborador = nombre.trim();
  }

  public updateDescripcionServicio(descripcion?: string): void {
    this._descripcionServicio = descripcion?.trim();
  }

  public updateDotaciones(personal: number, vehiculos: number): void {
    if (personal < 0 || vehiculos < 0) {
      throw new ValidationError('Dotaciones cannot be negative', 'dotaciones');
    }
    this._dotacionPersonal = personal;
    this._dotacionVehiculos = vehiculos;
  }

  public extendContract(newEndDate: Date): void {
    if (DateUtils.isBefore(newEndDate, this._startDate)) {
      throw new ValidationError('New end date cannot be before start date', 'endDate');
    }
    this._endDate = newEndDate;
  }

  public isActive(): boolean {
    return this._status === ContractStatus.ACTIVE;
  }

  public isExpired(): boolean {
    if (!this._endDate) return false;
    return DateUtils.isAfter(new Date(), this._endDate);
  }

  public getDuration(): number | null {
    if (!this._endDate) return null;
    const diffTime = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }

  public toJSON() {
    return {
      id: this.id,
      rutSociedad: this._rutSociedad,
      nombreColaborador: this._nombreColaborador,
      startDate: this._startDate,
      endDate: this._endDate,
      contractType: this._contractType,
      administradorContratoMandante: this._administradorContratoMandante,
      administradorContratoEmpresa: this._administradorContratoEmpresa,
      rutAdministradorContrato: this._rutAdministradorContrato,
      contractNumber: this._contractNumber,
      nombreMandante: this._nombreMandante,
      division: this._division,
      area: this._area,
      dotacionPersonal: this._dotacionPersonal,
      dotacionVehiculos: this._dotacionVehiculos,
      descripcionServicio: this._descripcionServicio,
      nombreProyecto: this._nombreProyecto,
      jornadaTrabajo: this._jornadaTrabajo,
      status: this._status,
      duration: this.getDuration(),
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}