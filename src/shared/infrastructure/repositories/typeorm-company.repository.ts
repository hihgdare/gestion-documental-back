import { Repository, IsNull } from 'typeorm';
import { type ICompanyRepository } from '@domains/company/repositories/company.repository.interface';
import { Company, type CompanyProps } from '@domains/company/entities/company.entity';
import { CompanyEntity } from '../database/entities/company.entity';
import { AppDataSource } from '../database/typeorm.config';
import { NotFoundError } from '@shared/domain/errors';

export class TypeOrmCompanyRepository implements ICompanyRepository {
  private repository: Repository<CompanyEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CompanyEntity);
  }

  async findAll(): Promise<Company[]> {
    const entities = await this.repository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<Company | null> {
    const entity = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByRut(rut: string): Promise<Company | null> {
    const entity = await this.repository.findOne({
      where: { rut, deletedAt: IsNull() },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByName(name: string): Promise<Company | null> {
    const entity = await this.repository.findOne({
      where: { name, deletedAt: IsNull() },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async create(company: Company): Promise<Company> {
    const entity = this.toEntity(company);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async update(company: Company): Promise<Company> {
    const entity = this.toEntity(company);
    await this.repository.update(company.id, entity);
    const updatedEntity = await this.repository.findOne({ where: { id: company.id } });
    if (!updatedEntity) {
      throw new NotFoundError('Empresa no encontrada');
    }
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }

  private toDomain(entity: CompanyEntity): Company {
    const props: CompanyProps = {
      id: entity.id,
      name: entity.name,
      rut: entity.rut,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
    return Company.create(props);
  }

  private toEntity(company: Company): Partial<CompanyEntity> {
    return {
      id: company.id,
      name: company.name,
      rut: company.rut,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      deletedAt: company.deletedAt,
    };
  }
}
