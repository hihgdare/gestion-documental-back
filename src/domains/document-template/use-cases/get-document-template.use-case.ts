import { DocumentTemplate } from '../entities/document-template.entity';
import type { DocumentTemplateRepository } from '../repositories/document-template.repository';

export class GetDocumentTemplateByIdUseCase {
  constructor(private readonly repository: DocumentTemplateRepository) {}

  async execute(id: string): Promise<DocumentTemplate> {
    const template = await this.repository.findById(id);
    if (!template) throw new Error('Template not found');
    return template;
  }
}

export class GetAllDocumentTemplatesUseCase {
  constructor(private readonly repository: DocumentTemplateRepository) {}

  async execute(): Promise<DocumentTemplate[]> {
    return this.repository.findAll();
  }
}
