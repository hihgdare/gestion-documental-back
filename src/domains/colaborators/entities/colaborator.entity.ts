import { BaseEntity } from '@shared/domain/base-entity';
import { UUID } from '@shared/utils/common';
import {
  ColaboratorStatus,
  DocumentType,
  Gender,
  CivilStatus,
} from '../value-objects/colaborator-enums';
import { ValidationError } from '@shared/domain/errors';

export interface ColaboratorProps {
  id?: string;
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nacionalidad: string;
  sexo: Gender;
  estadoCivil: CivilStatus;
  fechaNacimiento: Date;
  paisResidencia: string;
  region?: string;
  comuna?: string;
  estadoRegion?: string;
  ciudadMunicipio?: string;
  direccionResidencia: string;
  telefono: string;
  email: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  profesion: string;
  cargo: string;
  status?: ColaboratorStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ColaboratorJson {
  id: string;
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nombreCompleto: string;
  nacionalidad: string;
  sexo: Gender;
  estadoCivil: CivilStatus;
  fechaNacimiento: Date;
  edad: number;
  paisResidencia: string;
  region?: string;
  comuna?: string;
  estadoRegion?: string;
  ciudadMunicipio?: string;
  direccionResidencia: string;
  telefono: string;
  email: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  profesion: string;
  cargo: string;
  status: ColaboratorStatus;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Colaborator extends BaseEntity {
  private constructor(
    public id: string,
    private _tipoDocumento: DocumentType,
    private _numeroDocumento: string,
    private _nombre: string,
    private _apellidoPaterno: string,
    private _apellidoMaterno: string | undefined,
    private _nacionalidad: string,
    private _sexo: Gender,
    private _estadoCivil: CivilStatus,
    private _fechaNacimiento: Date,
    private _paisResidencia: string,
    private _region: string | undefined,
    private _comuna: string | undefined,
    private _estadoRegion: string | undefined,
    private _ciudadMunicipio: string | undefined,
    private _direccionResidencia: string,
    private _telefono: string,
    private _email: string,
    private _contactoEmergencia: string | undefined,
    private _telefonoEmergencia: string | undefined,
    private _profesion: string,
    private _cargo: string,
    private _status: ColaboratorStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {
    super();
  }

  public static create(props: ColaboratorProps): Colaborator {
    const id = props.id || UUID.generate().toString();
    const status = props.status || ColaboratorStatus.ACTIVE;

    this.validateRequired(props);
    this.validateEmail(props.email);
    this.validateLocation(props);
    this.validateAge(props.fechaNacimiento);

    return new Colaborator(
      id,
      props.tipoDocumento,
      props.numeroDocumento.trim(),
      props.nombre.trim(),
      props.apellidoPaterno.trim(),
      props.apellidoMaterno?.trim(),
      props.nacionalidad.trim(),
      props.sexo,
      props.estadoCivil,
      props.fechaNacimiento,
      props.paisResidencia.trim(),
      props.region?.trim(),
      props.comuna?.trim(),
      props.estadoRegion?.trim(),
      props.ciudadMunicipio?.trim(),
      props.direccionResidencia.trim(),
      props.telefono.trim(),
      props.email.trim().toLowerCase(),
      props.contactoEmergencia?.trim(),
      props.telefonoEmergencia?.trim(),
      props.profesion.trim(),
      props.cargo.trim(),
      status,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  public static fromPersistence(props: ColaboratorProps): Colaborator {
    const status = props.status || ColaboratorStatus.ACTIVE;

    return new Colaborator(
      props.id!,
      props.tipoDocumento,
      props.numeroDocumento,
      props.nombre,
      props.apellidoPaterno,
      props.apellidoMaterno,
      props.nacionalidad,
      props.sexo,
      props.estadoCivil,
      props.fechaNacimiento,
      props.paisResidencia,
      props.region,
      props.comuna,
      props.estadoRegion,
      props.ciudadMunicipio,
      props.direccionResidencia,
      props.telefono,
      props.email,
      props.contactoEmergencia,
      props.telefonoEmergencia,
      props.profesion,
      props.cargo,
      status,
      props.createdAt!,
      props.updatedAt!,
    );
  }

  private static validateRequired(props: ColaboratorProps): void {
    if (!props.tipoDocumento) {
      throw new ValidationError('Tipo de documento is required', 'tipoDocumento');
    }
    if (!props.numeroDocumento?.trim()) {
      throw new ValidationError('Número de documento is required', 'numeroDocumento');
    }
    if (!props.nombre?.trim()) {
      throw new ValidationError('Nombre is required', 'nombre');
    }
    if (!props.apellidoPaterno?.trim()) {
      throw new ValidationError('Apellido paterno is required', 'apellidoPaterno');
    }
    if (!props.nacionalidad?.trim()) {
      throw new ValidationError('Nacionalidad is required', 'nacionalidad');
    }
    if (!props.sexo) {
      throw new ValidationError('Sexo is required', 'sexo');
    }
    if (!props.estadoCivil) {
      throw new ValidationError('Estado civil is required', 'estadoCivil');
    }
    if (!props.fechaNacimiento) {
      throw new ValidationError('Fecha de nacimiento is required', 'fechaNacimiento');
    }
    if (!props.paisResidencia?.trim()) {
      throw new ValidationError('País de residencia is required', 'paisResidencia');
    }
    if (!props.direccionResidencia?.trim()) {
      throw new ValidationError('Dirección de residencia is required', 'direccionResidencia');
    }
    if (!props.telefono?.trim()) {
      throw new ValidationError('Teléfono is required', 'telefono');
    }
    if (!props.email?.trim()) {
      throw new ValidationError('Email is required', 'email');
    }
    if (!props.profesion?.trim()) {
      throw new ValidationError('Profesión is required', 'profesion');
    }
    if (!props.cargo?.trim()) {
      throw new ValidationError('Cargo is required', 'cargo');
    }
  }

  private static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
  }

  private static validateLocation(props: ColaboratorProps): void {
    if (props.paisResidencia === 'CL') {
      if (!props.region?.trim()) {
        throw new ValidationError('Región is required for Chile residents', 'region');
      }
      if (!props.comuna?.trim()) {
        throw new ValidationError('Comuna is required for Chile residents', 'comuna');
      }
    } else {
      if (!props.estadoRegion?.trim()) {
        throw new ValidationError('Estado/Región is required for non-Chile residents', 'estadoRegion');
      }
      if (!props.ciudadMunicipio?.trim()) {
        throw new ValidationError('Ciudad/Municipio is required for non-Chile residents', 'ciudadMunicipio');
      }
    }
  }

  private static validateAge(fechaNacimiento: Date): void {
    const today = new Date();
    const age = today.getFullYear() - fechaNacimiento.getFullYear();
    const monthDiff = today.getMonth() - fechaNacimiento.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < fechaNacimiento.getDate())) {
      // Adjust age if birthday hasn't occurred this year
    }

    if (age < 18) {
      throw new ValidationError('Colaborator must be at least 18 years old', 'fechaNacimiento');
    }

    if (age > 100) {
      throw new ValidationError('Invalid birth date', 'fechaNacimiento');
    }
  }

  // Getters
  public get tipoDocumento(): DocumentType {
    return this._tipoDocumento;
  }

  public get numeroDocumento(): string {
    return this._numeroDocumento;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get apellidoPaterno(): string {
    return this._apellidoPaterno;
  }

  public get apellidoMaterno(): string | undefined {
    return this._apellidoMaterno;
  }

  public get nacionalidad(): string {
    return this._nacionalidad;
  }

  public get sexo(): Gender {
    return this._sexo;
  }

  public get estadoCivil(): CivilStatus {
    return this._estadoCivil;
  }

  public get fechaNacimiento(): Date {
    return this._fechaNacimiento;
  }

  public get paisResidencia(): string {
    return this._paisResidencia;
  }

  public get region(): string | undefined {
    return this._region;
  }

  public get comuna(): string | undefined {
    return this._comuna;
  }

  public get estadoRegion(): string | undefined {
    return this._estadoRegion;
  }

  public get ciudadMunicipio(): string | undefined {
    return this._ciudadMunicipio;
  }

  public get direccionResidencia(): string {
    return this._direccionResidencia;
  }

  public get telefono(): string {
    return this._telefono;
  }

  public get email(): string {
    return this._email;
  }

  public get contactoEmergencia(): string | undefined {
    return this._contactoEmergencia;
  }

  public get telefonoEmergencia(): string | undefined {
    return this._telefonoEmergencia;
  }

  public get profesion(): string {
    return this._profesion;
  }

  public get cargo(): string {
    return this._cargo;
  }

  public get status(): ColaboratorStatus {
    return this._status;
  }

  // Business methods
  public getNombreCompleto(): string {
    if (this._apellidoMaterno) {
      return `${this._nombre} ${this._apellidoPaterno} ${this._apellidoMaterno}`;
    }
    return `${this._nombre} ${this._apellidoPaterno}`;
  }

  public getAge(): number {
    const today = new Date();
    let age = today.getFullYear() - this._fechaNacimiento.getFullYear();
    const monthDiff = today.getMonth() - this._fechaNacimiento.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this._fechaNacimiento.getDate())) {
      age--;
    }

    return age;
  }

  public activate(): void {
    if (this._status === ColaboratorStatus.TERMINATED) {
      throw new ValidationError('Cannot activate a terminated colaborator', 'status');
    }
    this._status = ColaboratorStatus.ACTIVE;
  }

  public suspend(): void {
    if (this._status === ColaboratorStatus.TERMINATED) {
      throw new ValidationError('Cannot suspend a terminated colaborator', 'status');
    }
    this._status = ColaboratorStatus.SUSPENDED;
  }

  public deactivate(): void {
    this._status = ColaboratorStatus.INACTIVE;
  }

  public terminate(): void {
    this._status = ColaboratorStatus.TERMINATED;
  }

  public updateContactInfo(telefono: string, email: string): void {
    if (!telefono?.trim()) {
      throw new ValidationError('Teléfono is required', 'telefono');
    }
    if (!email?.trim()) {
      throw new ValidationError('Email is required', 'email');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    this._telefono = telefono.trim();
    this._email = email.trim().toLowerCase();
  }

  public updateDireccion(direccion: string): void {
    if (!direccion?.trim()) {
      throw new ValidationError('Dirección is required', 'direccionResidencia');
    }
    this._direccionResidencia = direccion.trim();
  }

  public updateEmergencyContact(nombre?: string, telefono?: string): void {
    this._contactoEmergencia = nombre?.trim();
    this._telefonoEmergencia = telefono?.trim();
  }

  public updateCargo(cargo: string): void {
    if (!cargo?.trim()) {
      throw new ValidationError('Cargo is required', 'cargo');
    }
    this._cargo = cargo.trim();
  }

  public isActive(): boolean {
    return this._status === ColaboratorStatus.ACTIVE;
  }

  public toJSON(): ColaboratorJson {
    return {
      id: this.id,
      tipoDocumento: this._tipoDocumento,
      numeroDocumento: this._numeroDocumento,
      nombre: this._nombre,
      apellidoPaterno: this._apellidoPaterno,
      apellidoMaterno: this._apellidoMaterno,
      nombreCompleto: this.getNombreCompleto(),
      nacionalidad: this._nacionalidad,
      sexo: this._sexo,
      estadoCivil: this._estadoCivil,
      fechaNacimiento: this._fechaNacimiento,
      edad: this.getAge(),
      paisResidencia: this._paisResidencia,
      region: this._region,
      comuna: this._comuna,
      estadoRegion: this._estadoRegion,
      ciudadMunicipio: this._ciudadMunicipio,
      direccionResidencia: this._direccionResidencia,
      telefono: this._telefono,
      email: this._email,
      contactoEmergencia: this._contactoEmergencia,
      telefonoEmergencia: this._telefonoEmergencia,
      profesion: this._profesion,
      cargo: this._cargo,
      status: this._status,
      isActive: this.isActive(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
