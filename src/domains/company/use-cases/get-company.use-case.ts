import { ICompanyRepository } from '../repositories/company.repository.interface';
import { Company } from '../entities/company.entity';
import { NotFoundError } from '@shared/domain/errors';

export class GetCompanyByIdUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(id: string): Promise<Company> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa no encontrada');
    }
    return company;
  }
}

export class GetAllCompaniesUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(): Promise<Company[]> {
    return await this.companyRepository.findAll();
  }
}
