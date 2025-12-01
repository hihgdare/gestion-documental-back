import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';

export interface ContractDocumentRelation {
  id: string;
  contractId: string;
  documentId: string;
  createdAt: Date;
}

export class GetContractDocumentsRelationUseCase {
  public async execute(): Promise<ContractDocumentRelation[]> {
    const repo = AppDataSource.getRepository('contract_documents');
    const rows = await repo
      .createQueryBuilder('cd')
      .select(['cd.id as id', 'cd.contract_id as contractId', 'cd.document_id as documentId', 'cd.created_at as createdAt'])
      .orderBy('cd.created_at', 'DESC')
      .getRawMany();

    // Convert raw createdAt to Date
    return rows.map((r: any) => ({
      id: r.id,
      contractId: r.contractId,
      documentId: r.documentId,
      createdAt: r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt),
    }));
  }
}
