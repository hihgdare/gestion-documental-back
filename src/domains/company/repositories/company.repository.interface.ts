import { Company } from '../entities/company.entity';

export interface ICompanyRepository {
  findAll(): Promise<Company[]>;
  findById(id: string): Promise<Company | null>;
  findByRut(rut: string): Promise<Company | null>;
  findByName(name: string): Promise<Company | null>;
  create(company: Company): Promise<Company>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
