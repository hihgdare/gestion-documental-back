import { ContractRepository } from '../repositories/contract.repository';
import { Contract, UpdateContractProps } from '../entities/contract.entity';
import { NotFoundError } from '@shared/domain/errors';

export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) { }

  public async execute(request: UpdateContractProps): Promise<Contract> {
    const contract = await this.contractRepository.findById(request.id);
    if (!contract) {
      throw new NotFoundError('Contract', request.id);
    }

    if (request.nombreColaborador) {
      contract.updateNombreColaborador(request.nombreColaborador);
    }

    if (request.descripcionServicio !== undefined) {
      contract.updateDescripcionServicio(request.descripcionServicio);
    }

    if (request.dotacionPersonal !== undefined || request.dotacionVehiculos !== undefined) {
      contract.updateDotaciones(
        request.dotacionPersonal ?? contract.dotacionPersonal,
        request.dotacionVehiculos ?? contract.dotacionVehiculos,
      );
    }

    if (request.endDate) {
      contract.extendContract(new Date(request.endDate));
    }

    return await this.contractRepository.update(contract);
  }
}

export class ActivateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) { }

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
  constructor(private readonly contractRepository: ContractRepository) { }

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
  constructor(private readonly contractRepository: ContractRepository) { }

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
  constructor(private readonly contractRepository: ContractRepository) { }

  public async execute(id: string): Promise<void> {
    const contract = await this.contractRepository.findById(id);
    if (!contract) {
      throw new NotFoundError('Contract', id);
    }

    await this.contractRepository.delete(id);
  }
}
