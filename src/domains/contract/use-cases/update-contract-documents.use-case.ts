import { ContractRepository } from '../repositories/contract.repository';

export class UpdateContractDocumentsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(contractId: string, documentIds: string[]): Promise<void> {
    await this.contractRepository.updateDocuments(contractId, documentIds);
  }
}
