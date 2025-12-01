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
  existsByContractNumber(contractNumber: string): Promise<boolean>;
  findActiveContracts(): Promise<Contract[]>;
  findExpiredContracts(): Promise<Contract[]>;
  findContractsEndingBefore(date: Date): Promise<Contract[]>;
  findById(id: string): Promise<Contract | null>;
  findAll(): Promise<Contract[]>;
  save(contract: CreateContractProps): Promise<Contract>;
  update(contract: UpdateContractProps): Promise<Contract>;
  delete(id: string): Promise<void>;
  // Subcontract management
  addSubcontract(contractId: string, subcontractId: string): Promise<void>;
  removeSubcontract(contractId: string, subcontractId: string): Promise<void>;
  findSubcontracts(contractId: string): Promise<Contract[]>;
  // Document association management
  addDocument(contractId: string, documentId: string): Promise<void>;
  removeDocument(contractId: string, documentId: string): Promise<void>;
  updateDocuments(contractId: string, documentIds: string[]): Promise<void>;
  findContractsByDocumentId(documentId: string): Promise<Contract[]>;
}
