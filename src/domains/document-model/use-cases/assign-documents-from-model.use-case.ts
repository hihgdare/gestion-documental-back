import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { DocumentHistoryRepository } from '@domains/document/repositories/document-history.repository';
import { IDocumentModelRepository } from '@domains/document-model/repositories/document-model.repository.interface';
import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';
import { Document, DocumentProps } from '@domains/document/entities/document.entity';
import { DocumentHistoryProps } from '@domains/document/entities/document-history.entity';
import { DocumentAction } from '@domains/document/value-objects/document-enums';
import { ValidationError, NotFoundError } from '@shared/domain/errors';

export interface AssignDocumentsFromModelRequest {
  documentModelId: string;
  contractId: string;
  colaboratorIds: string[];
  createdBy?: string;
  comment?: string;
}

export interface AssignDocumentsFromModelResult {
  created: Document[];
  skipped: string[];
}

export class AssignDocumentsFromModelUseCase {
  constructor(
    private readonly documentModelRepository: IDocumentModelRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly documentHistoryRepository: DocumentHistoryRepository,
    private readonly contractRepository: ContractRepository,
    private readonly colaboratorRepository: ColaboratorRepository,
  ) {}

  public async execute(request: AssignDocumentsFromModelRequest): Promise<AssignDocumentsFromModelResult> {
    // Validar que exista el modelo
    const model = await this.documentModelRepository.findById(request.documentModelId);
    if (!model) {
      throw new NotFoundError('Modelo de documento no encontrado');
    }

    // Validar que exista el contrato
    const contract = await this.contractRepository.findById(request.contractId);
    if (!contract) {
      throw new ValidationError('Contrato no encontrado');
    }

    // Validar colaboradores
    if (!request.colaboratorIds || request.colaboratorIds.length === 0) {
      throw new ValidationError('Debe proporcionar al menos un colaborador');
    }

    const created: Document[] = [];
    const skipped: string[] = [];

    // Para cada colaborador, crear un documento basado en el modelo
    for (const colaboratorId of request.colaboratorIds) {
      const colaborator = await this.colaboratorRepository.findById(colaboratorId);
      if (!colaborator) {
        skipped.push(colaboratorId);
        continue;
      }

      // Verificar si ya existe un documento con esta combinación
      const exists = await this.documentRepository.existsByTypeSubtypeContractColaborator(
        model.documentTypeId,
        model.documentSubtypeId,
        request.contractId,
        [colaboratorId],
      );

      if (exists) {
        skipped.push(`${colaboratorId}`);
        continue;
      }

      // Crear el documento
      const typeName = model.documentTypeName || model.documentTypeId;
      const subtypeName = model.documentSubtypeName || model.documentSubtypeId;

      const props: DocumentProps = {
        documentTypeId: model.documentTypeId,
        documentSubtypeId: model.documentSubtypeId,
        colaboratorIds: [colaboratorId],
        name: `${typeName} - ${subtypeName}`,
        contractId: request.contractId,
        createdBy: request.createdBy,
        requiredForContract: model.requiredForContract,
        requiredForColaborator: model.requiredForColaborator,
        requiredExpirationDate: model.requiredExpirationDate,
        groupId: colaborator.groupId,
      };

      const doc = Document.create(props);
      const saved = await this.documentRepository.save(doc);
      created.push(saved);

      // Crear historial si es necesario
      if (request.createdBy && request.createdBy !== 'system') {
        const history: DocumentHistoryProps = {
          documentId: saved.id,
          documentTypeId: saved.documentTypeId,
          documentSubtypeId: saved.documentSubtypeId,
          name: saved.name,
          issuedDate: saved.issuedDate || undefined,
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
