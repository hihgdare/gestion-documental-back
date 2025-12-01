import { ContractRepository } from '../repositories/contract.repository';
import { Contract } from '../entities/contract.entity';

export class GetContractsByDocumentIdUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(documentId: string): Promise<Contract[]> {
    return this.contractRepository.findContractsByDocumentId(documentId);
  }
}
