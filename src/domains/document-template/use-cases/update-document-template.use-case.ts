// import removed: methods are used directly on the fetched entity
import type { DocumentTemplateRepository } from '../repositories/document-template.repository';

export class UpdateDocumentTemplateUseCase {
  constructor(private readonly repository: DocumentTemplateRepository) {}

  async execute(id: string, data: { name?: string; description?: string | null; documentTypeId?: string; documentSubtypeId?: string }) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new Error('Template not found');

    if (data.name) existing.updateName(data.name);
    if (data.description !== undefined) existing.updateDescription(data.description);
    if (data.documentTypeId) existing.documentTypeId = data.documentTypeId;
    if (data.documentSubtypeId) existing.documentSubtypeId = data.documentSubtypeId;

    return this.repository.update(existing);
  }
}

export class DeleteDocumentTemplateUseCase {
  constructor(private readonly repository: DocumentTemplateRepository) {}

  async execute(id: string) {
    await this.repository.delete(id);
  }
}
