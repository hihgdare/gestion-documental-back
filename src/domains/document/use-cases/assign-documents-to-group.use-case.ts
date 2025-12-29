import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document, DocumentProps } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { ValidationError } from '@shared/domain/errors';

export interface AssignDocumentsToGroupRequest {
  documentTypeId: string;
  documentSubtypeId: string;
  contractId: string;
  colaboratorIds: string[];
  issuedDate?: Date;
  expirationDate?: Date;
  name?: string;
  createdBy?: string;
  comment?: string;
}

export interface AssignDocumentsToGroupResult {
  created: Document[];
  skipped: string[];
}

export class AssignDocumentsToGroupUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly contractRepository: ContractRepository,
  ) {}

  public async execute(request: AssignDocumentsToGroupRequest): Promise<AssignDocumentsToGroupResult> {
    const contract = await this.contractRepository.findById(request.contractId);
    if (!contract) {
      throw new ValidationError('Contrato no encontrado');
    }

    if (!request.colaboratorIds || request.colaboratorIds.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un colaborador');
    }

    const created: Document[] = [];
    const skipped: string[] = [];

    for (const colaboratorId of request.colaboratorIds) {
      const exists = await this.documentRepository.existsByTypeSubtypeContractColaborator(
        request.documentTypeId,
        request.documentSubtypeId,
        request.contractId,
        [colaboratorId],
      );
      if (exists) {
        skipped.push(colaboratorId);
        continue;
      }

      const props: DocumentProps = {
        documentTypeId: request.documentTypeId,
        documentSubtypeId: request.documentSubtypeId,
        colaboratorIds: [colaboratorId],
        name: request.name?.trim() || `${request.documentTypeId} ${request.documentSubtypeId}`,
        issuedDate: request.issuedDate,
        expirationDate: request.expirationDate,
        contractId: request.contractId,
        createdBy: request.createdBy,
      };
      const doc = Document.create(props);
      const saved = await this.documentRepository.save(doc);
      created.push(saved);

      if (request.createdBy && request.createdBy !== 'system' && saved.issuedDate) {
        const history: DocumentHistoryProps = {
          documentId: saved.id,
          documentTypeId: saved.documentTypeId,
          documentSubtypeId: saved.documentSubtypeId,
          name: saved.name,
          issuedDate: saved.issuedDate,
          expirationDate: saved.expirationDate || undefined,
          contractId: saved.contractId || undefined,
          description: saved.description,
          documentUrl: saved.documentUrl,
          status: saved.status,
          comment: request.comment || null,
          action: DocumentAction.CREATED,
          updatedBy: request.createdBy,
        };
        await this.documentHistoryRepository.save(history);
      }
    }

    return { created, skipped };
  }
}
