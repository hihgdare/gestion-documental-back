import { ICompanyRepository } from '../repositories/company.repository.interface';
import { Company, CompanyProps } from '../entities/company.entity';
import { ConflictError } from '@shared/domain/errors';

export interface CreateCompanyRequest {
  name: string;
  rut: string;
}

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(request: CreateCompanyRequest): Promise<Company> {
    // Check if company already exists with the same RUT
    const existingCompany = await this.companyRepository.findByRut(request.rut);
    if (existingCompany) {
      throw new ConflictError('Ya existe una empresa con este RUT');
    }

    // Create company
    const companyProps: CompanyProps = {
      name: request.name,
      rut: request.rut,
    };

    const company = Company.create(companyProps);

    return await this.companyRepository.create(company);
  }
}
