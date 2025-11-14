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

export type NotNullId<Cl extends BasicProps<boolean>> = Partial<Omit<Cl, 'id'>> & {id: NonNullable<Cl['id']>};

export abstract class BaseEntity<Cl extends BaseEntity<Cl, IdType>, IdType = Cl['id']> {
  abstract id: unknown;
  abstract createdAt: Date;
  abstract updatedAt: Date;

  constructor(data: Partial<Cl>, isUUID: boolean = false) {
    Object.assign(this, data, {
      id: data.id ?? (isUUID ? uuid() : null),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });
  }

  equals(other: Cl): boolean {
    return this.id !== null && this.id === other.id;
  }

  abstract toJSON(): unknown;
}

export abstract class SoftDeleteEntity<Cl extends SoftDeleteEntity<Cl, IdType>, IdType = Cl['id']> extends BaseEntity<Cl, IdType> {
  abstract deletedAt: Date | null;

  constructor(data: Cl | Partial<Cl>, isUUID: boolean = false) {
    super(Object.assign(data, {
      deletedAt: data.deletedAt ?? null,
    }), isUUID);
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

export interface Repository<Cl extends BaseEntity<Cl, IdType>, IdType = Cl['id']> {
  findById(id: Exclude<IdType, null>): Promise<Cl | null>;
  findAll(): Promise<Cl[]>;
  save(request: Partial<Omit<Cl, 'id'>>): Promise<Cl>;
  update(request: NotNullId<Cl>): Promise<Cl>;
  delete(id: Exclude<IdType, null>): Promise<void>;
}
