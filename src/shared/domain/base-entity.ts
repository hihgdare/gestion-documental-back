import { v4 as uuid } from 'uuid';

export type BasicProps<WithSoftDelete extends boolean = false, KeyType = unknown> = {
  id: KeyType;
} & (WithSoftDelete extends true ? SoftDeleteProps : DateProps)

export interface DateProps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteProps extends DateProps {
  deletedAt: Date | null;
}

/**
 * Kn = Type of the key. It could be nullable.
 * K = Type of the key, excluding null.
 */
export abstract class BaseEntity<ClassName extends BaseEntity<ClassName, IdType>, IdType = ClassName['id']> {
  abstract id: unknown;
  abstract createdAt: Date;
  abstract updatedAt: Date;

  constructor(data: Partial<ClassName>, isUUID: boolean = false) {
    Object.assign(this, {
      ...data,
      id: data?.id ?? (isUUID ? uuid() : null),
      createdAt: data?.createdAt || new Date(),
      updatedAt: data?.updatedAt || new Date(),
    });
  }

  equals(other: ClassName): boolean {
    return this.id !== null && this.id === other.id;
  }

  abstract toJSON(): unknown;
}

export abstract class SoftDeleteEntity<ClassName extends SoftDeleteEntity<ClassName, IdType>, IdType = ClassName['id']> extends BaseEntity<ClassName, IdType> {
  abstract deletedAt: Date | null;

  constructor(data: ClassName | Partial<ClassName>, isUUID: boolean = false) {
    super({
      ...data,
      deletedAt: data?.deletedAt ?? null,
    }, isUUID);
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  restore(): void {
    this.deletedAt = null;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}

export interface Repository<ClassName extends BaseEntity<ClassName, IdType>, IdType = ClassName['id']> {
  findById(id: Exclude<IdType, null>): Promise<ClassName | null>;
  findAll(): Promise<ClassName[]>;
  save(request: Partial<Omit<ClassName, 'id'>>): Promise<ClassName>;
  update(id: Exclude<IdType, null>, request: Partial<Omit<ClassName, 'id'>>): Promise<ClassName>;
  delete(id: Exclude<IdType, null>): Promise<void>;
}
