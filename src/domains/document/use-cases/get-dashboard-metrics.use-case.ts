import { DocumentRepository } from '../repositories/document.repository';
import { DocumentStatus } from '../value-objects/document-enums';

export interface DashboardMetrics {
  documentsInDraft: number;
  documentsWithoutColaborator: number;
  documentsExpiringSoon: number;
  documentsInReview: number;
  recentDocuments: Document[];
  documentsRecentlyApproved: Document[];
}

export class GetDashboardMetricsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  public async execute(): Promise<DashboardMetrics> {
    const allDocuments = await this.documentRepository.findAll();

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
        doc.expirationDate <= new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    ).length;

    // Cantidad de documentos de documentos pendientes por aprobar (in_review)
    const documentsInReview = allDocuments.filter(
      (doc) => doc.status === DocumentStatus.IN_REVIEW,
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
      recentDocuments,
      documentsRecentlyApproved,
    };
  }
}
