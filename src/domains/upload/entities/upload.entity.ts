import { StorageType } from '../value-objects/storage-type';

export interface UploadJson {
  id: string;
  originalName: string;
  path: string;
  storage: StorageType;
  mimeType?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Upload {
  public readonly id!: string;
  public readonly originalName!: string;
  public readonly path!: string;
  public readonly storage!: StorageType;
  public readonly mimeType?: string;
  public readonly size?: number;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: Omit<UploadJson, 'id'> & { id?: string }) {
    Object.assign(this, props);
  }

  toJSON(): UploadJson {
    return {
      id: this.id,
      originalName: this.originalName,
      path: this.path,
      storage: this.storage,
      mimeType: this.mimeType,
      size: this.size,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

