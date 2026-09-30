import { FileShare } from '../entities/file-share.entity';
import { FileShareRepository } from '../repositories/file-share.repository';
import { FileRepository } from '@domains/file/repositories/file.repository';
import { NotFoundError } from '@shared/domain/errors';

export class CreateFileShareUseCase {
  constructor(
    private readonly fileShareRepository: FileShareRepository,
    private readonly fileRepository: FileRepository,
  ) {}

  async execute(fileId: string, createdBy: string): Promise<FileShare> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundError('Archivo', fileId);

    const fileShare = new FileShare({ fileId, createdBy });
    return this.fileShareRepository.save(fileShare);
  }
}
