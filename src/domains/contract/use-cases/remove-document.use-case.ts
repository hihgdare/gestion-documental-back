import { ContractRepository } from '../repositories/contract.repository';

export class RemoveDocumentFromContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(contractId: string, documentId: string): Promise<void> {
    await this.contractRepository.removeDocument(contractId, documentId);
  }
}
