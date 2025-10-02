import { Repository } from 'typeorm';
import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { Contract, ContractProps } from '@domains/contract/entities/contract.entity';
import { ContractStatus, ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';
import { ContractEntity } from '../database/entities/contract.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmContractRepository implements ContractRepository {
  private repository: Repository<ContractEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ContractEntity);
  }

  async findById(id: string): Promise<Contract | null> {
    const contractEntity = await this.repository.findOne({ where: { id } });
    if (!contractEntity) return null;
    return this.toDomain(contractEntity);
  }

  async findAll(): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async save(contract: Contract): Promise<Contract> {
    const contractEntity = this.toEntity(contract);
    const savedEntity = await this.repository.save(contractEntity);
    return this.toDomain(savedEntity);
  }

  async update(contract: Contract): Promise<Contract> {
    const contractEntity = this.toEntity(contract);
    await this.repository.update(contract.id, contractEntity);
    const updatedEntity = await this.repository.findOne({ where: { id: contract.id } });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByRutSociedad(rutSociedad: string): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { rutSociedad },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByNombreColaborador(nombre: string): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { nombreColaborador: nombre },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: ContractStatus): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByContractType(type: ContractType): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { contractType: type },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByNombreMandante(nombreMandante: string): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { nombreMandante },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByDivision(division: string): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { division },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByArea(area: string): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { area },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByJornadaTrabajo(jornada: JornadaTrabajo): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { jornadaTrabajo: jornada },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findByContractNumber(contractNumber: string): Promise<Contract | null> {
    const contractEntity = await this.repository.findOne({
      where: { contractNumber },
    });
    if (!contractEntity) return null;
    return this.toDomain(contractEntity);
  }

  async findActiveContracts(): Promise<Contract[]> {
    const contractEntities = await this.repository.find({
      where: { status: ContractStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findExpiredContracts(): Promise<Contract[]> {
    const now = new Date();
    const contractEntities = await this.repository
      .createQueryBuilder('contract')
      .where('contract.endDate < :now', { now })
      .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
      .orderBy('contract.createdAt', 'DESC')
      .getMany();
    
    return contractEntities.map(entity => this.toDomain(entity));
  }

  async findContractsEndingBefore(date: Date): Promise<Contract[]> {
    const contractEntities = await this.repository
      .createQueryBuilder('contract')
      .where('contract.endDate <= :date', { date })
      .andWhere('contract.status = :status', { status: ContractStatus.ACTIVE })
      .orderBy('contract.endDate', 'ASC')
      .getMany();
    
    return contractEntities.map(entity => this.toDomain(entity));
  }

  private toDomain(entity: ContractEntity): Contract {
    const props: ContractProps = {
      id: entity.id,
      rutSociedad: entity.rutSociedad,
      nombreColaborador: entity.nombreColaborador,
      startDate: entity.startDate,
      endDate: entity.endDate,
      contractType: entity.contractType as ContractType,
      administradorContratoMandante: entity.administradorContratoMandante,
      administradorContratoEmpresa: entity.administradorContratoEmpresa,
      rutAdministradorContrato: entity.rutAdministradorContrato,
      contractNumber: entity.contractNumber,
      nombreMandante: entity.nombreMandante,
      division: entity.division,
      area: entity.area,
      dotacionPersonal: entity.dotacionPersonal,
      dotacionVehiculos: entity.dotacionVehiculos,
      descripcionServicio: entity.descripcionServicio,
      nombreProyecto: entity.nombreProyecto,
      jornadaTrabajo: entity.jornadaTrabajo as JornadaTrabajo,
      status: entity.status as ContractStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    return Contract.fromPersistence(props);
  }

  private toEntity(contract: Contract): Partial<ContractEntity> {
    return {
      id: contract.id,
      rutSociedad: contract.rutSociedad,
      nombreColaborador: contract.nombreColaborador,
      startDate: contract.startDate,
      endDate: contract.endDate || undefined,
      contractType: contract.contractType,
      administradorContratoMandante: contract.administradorContratoMandante,
      administradorContratoEmpresa: contract.administradorContratoEmpresa,
      rutAdministradorContrato: contract.rutAdministradorContrato,
      contractNumber: contract.contractNumber,
      nombreMandante: contract.nombreMandante,
      division: contract.division,
      area: contract.area,
      dotacionPersonal: contract.dotacionPersonal,
      dotacionVehiculos: contract.dotacionVehiculos,
      descripcionServicio: contract.descripcionServicio,
      nombreProyecto: contract.nombreProyecto,
      jornadaTrabajo: contract.jornadaTrabajo,
      status: contract.status,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }
}