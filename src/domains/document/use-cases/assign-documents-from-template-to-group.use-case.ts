import { DocumentRepository } from '../repositories/document.repository';
import { DocumentHistoryRepository } from '../repositories/document-history.repository';
import { Document, DocumentProps } from '../entities/document.entity';
import { DocumentHistoryProps } from '../entities/document-history.entity';
import { DocumentAction } from '../value-objects/document-enums';
import { ColaboratorGroupRepository } from '@domains/colaborator-group/repositories/colaborator-group.repository';
import { DocumentTemplateRepository } from '@domains/document-template/repositories/document-template.repository';
import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { ValidationError } from '@shared/domain/errors';

export interface AssignDocumentsFromTemplateToGroupRequest {
  templateId: string;
  contractId: string;
  groupId: number;
  issuedDate?: Date;
  expirationDate?: Date;
  name?: string;
  createdBy?: string;
  comment?: string;
}

export interface AssignDocumentsFromTemplateToGroupResult {
  created: Document[];
  skipped: string[];
}

export class AssignDocumentsFromTemplateToGroupUseCase {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly colaboratorGroupRepository: ColaboratorGroupRepository,
    private readonly documentTemplateRepository: DocumentTemplateRepository,
    private readonly contractRepository: ContractRepository,
  ) {}

  public async execute(request: AssignDocumentsFromTemplateToGroupRequest): Promise<AssignDocumentsFromTemplateToGroupResult> {
    const template = await this.documentTemplateRepository.findById(request.templateId);
    if (!template) {
      throw new ValidationError('Plantilla de documento no encontrada');
    }

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
      const exists = await this.documentRepository.existsByTemplateContractColaborator(
        request.templateId,
        request.contractId,
        [colaborator.id],
      );
      if (exists) {
        skipped.push(colaborator.id);
        continue;
      }

      const props: DocumentProps = {
        templateId: request.templateId,
        colaboratorIds: [colaborator.id],
        name: request.name?.trim() || template.name,
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
          templateId: saved.templateId,

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
