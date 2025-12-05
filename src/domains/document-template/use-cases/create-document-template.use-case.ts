import { DocumentTemplate } from '../entities/document-template.entity';
import type { DocumentTemplateRepository } from '../repositories/document-template.repository';

export class CreateDocumentTemplateUseCase {
  constructor(private readonly repository: DocumentTemplateRepository) {}

  async execute(request: { name: string; description?: string | null; documentTypeId: string; documentSubtypeId: string }) {
    const template = DocumentTemplate.create({
      name: request.name,
      description: request.description ?? null,
      documentTypeId: request.documentTypeId,
      documentSubtypeId: request.documentSubtypeId,
    });

    return this.repository.save(template);
  }
}
