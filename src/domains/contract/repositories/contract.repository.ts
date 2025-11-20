import { Contract, CreateContractProps, UpdateContractProps } from '../entities/contract.entity';
import { ContractStatus, ContractType, JornadaTrabajo } from '../value-objects/contract-enums';

export interface ContractRepository {
  findByRutSociedad(rutSociedad: string): Promise<Contract[]>;
  findByNombreColaborador(nombre: string): Promise<Contract[]>;
  findByStatus(status: ContractStatus): Promise<Contract[]>;
  findByContractType(type: ContractType): Promise<Contract[]>;
  findByNombreMandante(nombreMandante: string): Promise<Contract[]>;
  findByDivision(division: string): Promise<Contract[]>;
  findByArea(area: string): Promise<Contract[]>;
  findByJornadaTrabajo(jornada: JornadaTrabajo): Promise<Contract[]>;
  findByContractNumber(contractNumber: string): Promise<Contract | null>;
  findActiveContracts(): Promise<Contract[]>;
  findExpiredContracts(): Promise<Contract[]>;
  findContractsEndingBefore(date: Date): Promise<Contract[]>;
  findById(id: string): Promise<Contract | null>;
  findAll(): Promise<Contract[]>;
  save(contract: CreateContractProps): Promise<Contract>;
  update(contract: UpdateContractProps): Promise<Contract>;
  delete(id: string): Promise<void>;
}
