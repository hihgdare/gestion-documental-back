import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { Document } from '@domains/document/entities/document.entity';

export class GetContractDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(contractId: string): Promise<Document[]> {
    return await this.documentRepository.findByContractId(contractId);
  }
}
