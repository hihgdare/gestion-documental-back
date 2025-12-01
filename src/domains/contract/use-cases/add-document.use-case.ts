import { ContractRepository } from '../repositories/contract.repository';

export class AddDocumentToContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(contractId: string, documentId: string): Promise<void> {
    await this.contractRepository.addDocument(contractId, documentId);
  }
}
