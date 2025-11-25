import { DocumentRepository } from '../repositories/document.repository';
import { Document, DocumentProps } from '../entities/document.entity';

export interface CreateDocumentRequest {
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: Date;
  expirationDate?: Date;
  contractId: string;
  description?: string;
  documentUrl?: string;
  createdBy: string;
  comment?: string;
}

export class CreateDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(request: CreateDocumentRequest): Promise<Document> {
    // Create document
    const documentProps: DocumentProps = {
      documentTypeId: request.documentTypeId,
      documentSubtypeId: request.documentSubtypeId,
      name: request.name,
      issuedDate: request.issuedDate,
      expirationDate: request.expirationDate,
      contractId: request.contractId,
      description: request.description,
      documentUrl: request.documentUrl,
      createdBy: request.createdBy,
    };

    const document = Document.create(documentProps);

    return await this.documentRepository.save(document);
  }
}
