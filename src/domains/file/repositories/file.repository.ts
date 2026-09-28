import { File } from '../entities/file.entity';

export interface FileRepository {
  getContent(file: File): Promise<Buffer>;
  save(file: File): Promise<File>;
  saveBuffer(buffer: Buffer, filename: string, mimeType?: string, size?: number, groupId?: number): Promise<File>;
  findById(id: string): Promise<File | null>;
  findByIdIncludingDeleted(id: string): Promise<File | null>;
  softDelete(id: string): Promise<void>;
}
