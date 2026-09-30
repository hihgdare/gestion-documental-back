import { File } from '../entities/file.entity';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { assertStorageQuotaNotExceeded } from '@domains/document/use-cases/assert-storage-quota';
import { FileRepository } from '@domains/file/repositories/file.repository';

export interface UploadFileRequest {
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  size?: number;
  groupId?: number;
}

export class UploadFileUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly documentRepository: DocumentRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(request: UploadFileRequest): Promise<File> {
    if (request.groupId) {
      await assertStorageQuotaNotExceeded(
        request.groupId,
        request.size ?? request.buffer.length,
        this.documentRepository,
        this.groupPlanRepository,
        this.planRepository,
      );
    }

    return this.fileRepository.saveBuffer(request.buffer, request.filename, request.mimeType, request.size, request.groupId);
  }
}
