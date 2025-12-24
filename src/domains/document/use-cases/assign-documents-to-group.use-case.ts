import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document, DocumentProps } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { ColaboratorGroupRepository } from '@domains/colaborator-group/repositories/colaborator-group.repository';
import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { ValidationError } from '@shared/domain/errors';

export interface AssignDocumentsToGroupRequest {
  documentTypeId: string;
  documentSubtypeId: string;
  contractId: string;
  groupId: number;
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
    private readonly colaboratorGroupRepository: ColaboratorGroupRepository,
    private readonly contractRepository: ContractRepository,
  ) {}

  public async execute(request: AssignDocumentsToGroupRequest): Promise<AssignDocumentsToGroupResult> {
    const contract = await this.contractRepository.findById(request.contractId);
    if (!contract) {
      throw new ValidationError('Contrato no encontrado');
    }

    const group = await this.colaboratorGroupRepository.findById(request.groupId);
    if (!group) {
      throw new ValidationError('Grupo de colaboradores no encontrado');
    }

    const created: Document[] = [];
    const skipped: string[] = [];

    for (const colaborator of group.colaborators) {
      const exists = await this.documentRepository.existsByTypeSubtypeContractColaborator(
        request.documentTypeId,
        request.documentSubtypeId,
        request.contractId,
        [colaborator.id],
      );
      if (exists) {
        skipped.push(colaborator.id);
        continue;
      }

      const props: DocumentProps = {
        documentTypeId: request.documentTypeId,
        documentSubtypeId: request.documentSubtypeId,
        colaboratorIds: [colaborator.id],
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
