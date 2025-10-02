import { ContractRepository } from '../repositories/contract.repository';
import { Contract } from '../entities/contract.entity';
import { NotFoundError } from '@shared/domain/errors';
import { ContractStatus, ContractType } from '../value-objects/contract-enums';

export class GetContractByIdUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }
    return contract;
  }
}

export class GetAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(): Promise<Contract[]> {
    return await this.contractRepository.findAll();
  }
}

export class GetContractsByEmployeeUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(employeeId: string): Promise<Contract[]> {
    return await this.contractRepository.findByEmployeeId(employeeId);
  }
}

export class GetContractsByStatusUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(status: ContractStatus): Promise<Contract[]> {
    return await this.contractRepository.findByStatus(status);
  }
}

export class GetContractsByTypeUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(type: ContractType): Promise<Contract[]> {
    return await this.contractRepository.findByType(type);
  }
}

export class GetActiveContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(): Promise<Contract[]> {
    return await this.contractRepository.findActiveContracts();
  }
}

export class GetExpiredContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(): Promise<Contract[]> {
    return await this.contractRepository.findExpiredContracts();
  }
}