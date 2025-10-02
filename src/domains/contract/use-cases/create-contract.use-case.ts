import { ContractRepository } from '../repositories/contract.repository';
import { Contract, ContractProps } from '../entities/contract.entity';
import { ContractType } from '../value-objects/contract-enums';

export interface CreateContractRequest {
  employeeId: string;
  title: string;
  description?: string;
  type: ContractType;
  salary: {
    amount: number;
    currency?: string;
  };
  startDate: Date;
  endDate?: Date;
  departmentId: string;
  managerId: string;
}

export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(request: CreateContractRequest): Promise<Contract> {
    const contractProps: ContractProps = {
      ...request,
      startDate: new Date(request.startDate),
      endDate: request.endDate ? new Date(request.endDate) : undefined,
    };

    const contract = Contract.create(contractProps);
    
    return await this.contractRepository.save(contract);
  }
}