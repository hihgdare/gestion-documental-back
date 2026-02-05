import { DocumentRepository } from '../repositories/document.repository';
import { DocumentStatus } from '../value-objects/document-enums';

export interface DashboardMetrics {
  documentsInDraft: number;
  documentsWithoutColaborator: number;
  documentsExpiringSoon: number;
  documentsInReview: number;
  pendingRequiredForContract: number;
  pendingRequiredForColaborator: number;
  recentDocuments: Document[];
  documentsRecentlyApproved: Document[];
}

export class GetDashboardMetricsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(groupId?: number): Promise<DashboardMetrics> {
    const allDocuments = await this.documentRepository.findAll(groupId);

    // Cantidad de documentos en estado borrador (draft)
    const documentsInDraft = allDocuments.filter(
      (doc) => doc.status === DocumentStatus.DRAFT,
    ).length;

    // Cantidad de documentos sin colaboradores asignados
    const documentsWithoutColaborator = allDocuments.filter(
      (doc) => !doc.colaboratorIds || doc.colaboratorIds.length === 0,
    ).length;

    // Cantidad de documentos por vencer en los próximos 30 días
    const documentsExpiringSoon = allDocuments.filter(
      (doc) => doc.expirationDate !== null &&
        doc.status === DocumentStatus.APPROVED &&
        doc.expirationDate <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    ).length;

    // Cantidad de documentos de documentos pendientes por aprobar (in_review)
    const documentsInReview = allDocuments.filter(
      (doc) => doc.status === DocumentStatus.IN_REVIEW,
    ).length;

    // Cantidad de documentos obligatorios del Contrato en estado Pendiente
    const pendingRequiredForContract = allDocuments.filter(
      (doc) => doc.requiredForContract === true &&
        (doc.status === DocumentStatus.DRAFT || doc.status === DocumentStatus.REJECTED_WITH_COMMENTS),
    ).length;

    // Cantidad de documentos obligatorios del Colaborador en estado Pendiente
    const pendingRequiredForColaborator = allDocuments.filter(
      (doc) => doc.requiredForColaborator === true &&
        (doc.status === DocumentStatus.DRAFT || doc.status === DocumentStatus.REJECTED_WITH_COMMENTS),
    ).length;

    // Listas de los 10 documentos más recientemente creados
    const recentDocuments = allDocuments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    // Listas de los 10 documentos más recientemente aprobados
    const documentsRecentlyApproved = allDocuments
      .filter((doc) => doc.status === DocumentStatus.APPROVED && doc.updatedAt !== null)
      .sort((a, b) => (b.updatedAt!.getTime() - a.updatedAt!.getTime()))
      .slice(0, 10);
    return {
      documentsInDraft,
      documentsWithoutColaborator,
      documentsExpiringSoon,
      documentsInReview,
      pendingRequiredForContract,
      pendingRequiredForColaborator,
      recentDocuments,
      documentsRecentlyApproved,
    };
  }
}
