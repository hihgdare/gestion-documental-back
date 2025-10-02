import { ContractRepository } from '../repositories/contract.repository';
import { Contract } from '../entities/contract.entity';
import { NotFoundError } from '@shared/domain/errors';

export interface UpdateContractRequest {
  title?: string;
  description?: string;
  salary?: {
    amount: number;
    currency?: string;
  };
  endDate?: Date;
}

export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(id: string, request: UpdateContractRequest): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }

    if (request.title) {
      contract.updateTitle(request.title);
    }

    if (request.description !== undefined) {
      contract.updateDescription(request.description);
    }

    if (request.salary) {
      contract.updateSalary(request.salary.amount, request.salary.currency);
    }

    if (request.endDate) {
      contract.extendContract(new Date(request.endDate));
    }

    return await this.contractRepository.update(contract);
  }
}

export class ActivateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }

    contract.activate();
    return await this.contractRepository.update(contract);
  }
}

export class SuspendContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }

    contract.suspend();
    return await this.contractRepository.update(contract);
  }
}

export class TerminateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }

    contract.terminate();
    return await this.contractRepository.update(contract);
  }
}

export class DeleteContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(id: string): Promise<void> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }

    await this.contractRepository.delete(id);
  }
}