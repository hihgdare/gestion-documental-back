import { DocumentRepository } from '../repositories/document.repository';
import { Document } from '../entities/document.entity';
import { NotFoundError } from '@shared/domain/errors';

export class GetDocumentByIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(id: string): Promise<Document> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw new NotFoundError('Documento', id);
    }
    return document;
  }
}

export class GetAllDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(): Promise<Document[]> {
    return await this.documentRepository.findAll();
  }
}

export class GetDocumentsByContractIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(contractId: string): Promise<Document[]> {
    return await this.documentRepository.findByContractId(contractId);
  }
}

export class GetDocumentsByTemplateIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(templateId: string): Promise<Document[]> {
    return await this.documentRepository.findByTemplateId(templateId);
  }
}

export class GetDocumentsByColaboratorIdUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(colaboratorId: string): Promise<Document[]> {
    return await this.documentRepository.findByColaboratorIds([colaboratorId]);
  }
}

export class GetExpiredDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(): Promise<Document[]> {
    return await this.documentRepository.findExpiredDocuments();
  }
}

export class GetExpiringDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(days: number): Promise<Document[]> {
    return await this.documentRepository.findExpiringDocuments(days);
  }
}
