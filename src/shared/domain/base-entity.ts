export abstract class BaseEntity {
  protected constructor(
    public readonly id: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  public equals(other: BaseEntity): boolean {
    return this.id === other.id;
  }
}

export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}