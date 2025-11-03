import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('colaborators')
@Index(['numeroDocumento'], { unique: true })
@Index(['email'], { unique: true })
@Index(['nombre', 'apellidoPaterno'])
@Index(['status'])
export class ColaboratorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ['rut', 'pasaporte', 'dni', 'otro'],
    name: 'tipo_documento',
  })
  tipoDocumento!: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'numero_documento' })
  numeroDocumento!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100, name: 'apellido_paterno' })
  apellidoPaterno!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'apellido_materno' })
  apellidoMaterno?: string;

  @Column({ type: 'varchar', length: 100 })
  nacionalidad!: string;

  @Column({
    type: 'enum',
    enum: ['masculino', 'femenino', 'otro'],
  })
  sexo!: string;

  @Column({
    type: 'enum',
    enum: ['soltero', 'casado', 'divorciado', 'viudo', 'union_civil'],
    name: 'estado_civil',
  })
  estadoCivil!: string;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fechaNacimiento!: Date;

  @Column({ type: 'varchar', length: 2, name: 'pais_residencia', default: 'CL' })
  paisResidencia!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  comuna?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'estado_region' })
  estadoRegion?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ciudad_municipio' })
  ciudadMunicipio?: string;

  @Column({ type: 'varchar', length: 255, name: 'direccion_residencia' })
  direccionResidencia!: string;

  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contacto_emergencia' })
  contactoEmergencia?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'telefono_emergencia' })
  telefonoEmergencia?: string;

  @Column({ type: 'varchar', length: 100 })
  profesion!: string;

  @Column({ type: 'varchar', length: 100 })
  cargo!: string;

  @Column({
    type: 'enum',
    enum: ['activo', 'inactivo', 'suspendido', 'terminado'],
    default: 'activo',
  })
  status!: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp',
    precision: 6,
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;
}
