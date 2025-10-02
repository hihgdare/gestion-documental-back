import { Repository } from '@shared/domain/base-entity';
import { Contract } from '../entities/contract.entity';
import { ContractStatus, ContractType } from '../value-objects/contract-enums';

export interface ContractRepository extends Repository<Contract> {
  findByEmployeeId(employeeId: string): Promise<Contract[]>;
  findByStatus(status: ContractStatus): Promise<Contract[]>;
  findByType(type: ContractType): Promise<Contract[]>;
  findByDepartmentId(departmentId: string): Promise<Contract[]>;
  findByManagerId(managerId: string): Promise<Contract[]>;
  findActiveContracts(): Promise<Contract[]>;
  findExpiredContracts(): Promise<Contract[]>;
  findContractsEndingBefore(date: Date): Promise<Contract[]>;
}