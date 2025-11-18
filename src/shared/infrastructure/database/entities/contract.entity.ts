import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { EnumColumn } from '@shared/infrastructure/database/entities/utils/decorators';
import { UserEntity } from '@shared/infrastructure/database/entities/user.entity';

@Entity('contracts')
@Index(['rutSociedad'])
@Index(['nombreColaborador'])
@Index(['contractType'])
@Index(['status'])
export class ContractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'rut_sociedad', type: 'varchar', length: 12 })
  rutSociedad!: string;

  @Column({ name: 'nombre_colaborador', type: 'varchar', length: 255 })
  nombreColaborador!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date | null;

  @EnumColumn({
    name: 'contract_type',
    enum: ['indefinido', 'plazo_fijo', 'obra_faena', 'consultoria', 'honorarios'],
  })
  contractType!: string;

  @Column({ name: 'administrador_contrato_mandante', type: 'varchar', length: 255 })
  administradorContratoMandante!: string;

  @Column({ name: 'administrador_contrato_empresa', type: 'varchar', length: 255 })
  administradorContratoEmpresa!: string;

  @Column({ name: 'rut_administrador_contrato', type: 'varchar', length: 12 })
  rutAdministradorContrato!: string;

  @Column({ name: 'contract_number', type: 'varchar', length: 50, unique: true })
  contractNumber!: string;

  @Column({ name: 'nombre_mandante', type: 'varchar', length: 255 })
  nombreMandante!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  division?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area?: string;

  @Column({ name: 'dotacion_personal', type: 'int', default: 0 })
  dotacionPersonal!: number;

  @Column({ name: 'dotacion_vehiculos', type: 'int', default: 0 })
  dotacionVehiculos!: number;

  @Column({ name: 'descripcion_servicio', type: 'text', nullable: true })
  descripcionServicio?: string;

  @Column({ name: 'nombre_proyecto', type: 'varchar', length: 255, nullable: true })
  nombreProyecto?: string;

  @EnumColumn({
    name: 'jornada_trabajo',
    enum: ['completa', 'parcial', 'turno', 'especial'],
    default: 'completa',
  })
  jornadaTrabajo!: string;

  @EnumColumn({
    enum: ['draft', 'active', 'suspended', 'terminated', 'expired'],
    default: 'draft',
  })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  // Relations
  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'employee_id' })
  employee?: UserEntity;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId?: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'manager_id' })
  manager?: UserEntity;
}
