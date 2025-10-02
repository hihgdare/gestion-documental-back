import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('contracts')
@Index(['rutSociedad'])
@Index(['nombreColaborador'])
@Index(['contractNumber'], { unique: true })
@Index(['contractType'])
@Index(['status'])
export class ContractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 12, name: 'rut_sociedad' })
  rutSociedad!: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_colaborador' })
  nombreColaborador!: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true, name: 'end_date' })
  endDate?: Date;

  @Column({
    type: 'enum',
    enum: ['indefinido', 'plazo_fijo', 'obra_faena', 'consultoria', 'honorarios'],
    name: 'contract_type',
  })
  contractType!: string;

  @Column({ type: 'varchar', length: 255, name: 'administrador_contrato_mandante' })
  administradorContratoMandante!: string;

  @Column({ type: 'varchar', length: 255, name: 'administrador_contrato_empresa' })
  administradorContratoEmpresa!: string;

  @Column({ type: 'varchar', length: 12, name: 'rut_administrador_contrato' })
  rutAdministradorContrato!: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'contract_number' })
  contractNumber!: string;

  @Column({ type: 'varchar', length: 255, name: 'nombre_mandante' })
  nombreMandante!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  division?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area?: string;

  @Column({ type: 'int', default: 0, name: 'dotacion_personal' })
  dotacionPersonal!: number;

  @Column({ type: 'int', default: 0, name: 'dotacion_vehiculos' })
  dotacionVehiculos!: number;

  @Column({ type: 'text', nullable: true, name: 'descripcion_servicio' })
  descripcionServicio?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'nombre_proyecto' })
  nombreProyecto?: string;

  @Column({
    type: 'enum',
    enum: ['completa', 'parcial', 'turno', 'especial'],
    default: 'completa',
    name: 'jornada_trabajo',
  })
  jornadaTrabajo!: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'suspended', 'terminated', 'expired'],
    default: 'draft',
  })
  status!: string;

  @CreateDateColumn({ 
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'employee_id' })
  employee?: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'manager_id' })
  manager?: UserEntity;
}