import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { Contract, CreateContractProps } from '@domains/contract/entities/contract.entity';
import { ConflictError } from '@shared/domain/errors';

export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(request: CreateContractProps): Promise<Contract> {
    // Check if contract number already exists
    const existingContract = await this.contractRepository.findByContractNumber(request.contractNumber);
    if (existingContract) {
      throw new ConflictError('Contract with this number already exists');
    }

    const contract = new Contract(request);

    return await this.contractRepository.save(contract);
  }
}
