import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { UploadFileUseCase } from './upload-file.use-case';
import { File } from '../entities/file.entity';
import { GroupPlan } from '@domains/plan/entities/group-plan.entity';
import { Plan } from '@domains/plan/entities/plan.entity';
import { DocumentRepository } from '@domains/document/repositories/document.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';
import { FileRepository } from '@domains/file/repositories/file.repository';
import { PlanQuotaExceededError } from '@shared/domain/errors';
import { BYTES_PER_GB } from '@shared/utils/storage';

describe('UploadFileUseCase', () => {
  let saveBuffer: ReturnType<typeof mock>;
  let getStorageUsedByGroupId: ReturnType<typeof mock>;
  let useCase: UploadFileUseCase;

  beforeEach(() => {
    saveBuffer = mock(() => Promise.resolve(new File({ originalName: 'a.pdf', path: 'a.pdf', storage: 'local' })));
    getStorageUsedByGroupId = mock(() => Promise.resolve(BYTES_PER_GB - 10));

    const fileRepository = { saveBuffer } as unknown as FileRepository;
    const documentRepository = { getStorageUsedByGroupId } as unknown as DocumentRepository;
    const groupPlanRepository = {
      findActiveByGroupId: mock(() => Promise.resolve(new GroupPlan({ groupId: 1, planId: 'plan-id' }))),
    } as unknown as GroupPlanRepository;
    const planRepository = {
      findById: mock(() => Promise.resolve(new Plan({ name: 'Básico', maxStorageGb: 1 }))),
    } as unknown as PlanRepository;

    useCase = new UploadFileUseCase(fileRepository, documentRepository, groupPlanRepository, planRepository);
  });

  it('sube el archivo y lo asocia al grupo si hay espacio disponible', async () => {
    await useCase.execute({ buffer: Buffer.alloc(5), filename: 'a.pdf', groupId: 1 });
    expect(saveBuffer).toHaveBeenCalledWith(expect.any(Buffer), 'a.pdf', undefined, undefined, 1);
  });

  it('rechaza la subida si supera la cuota de almacenamiento del grupo', async () => {
    await expect(useCase.execute({ buffer: Buffer.alloc(20), filename: 'a.pdf', groupId: 1 }))
      .rejects.toThrow(PlanQuotaExceededError);
    expect(saveBuffer).not.toHaveBeenCalled();
  });

  it('no revisa la cuota si la sesión no tiene grupo', async () => {
    await useCase.execute({ buffer: Buffer.alloc(20), filename: 'a.pdf' });
    expect(getStorageUsedByGroupId).not.toHaveBeenCalled();
    expect(saveBuffer).toHaveBeenCalledTimes(1);
  });
});
