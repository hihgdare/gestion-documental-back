import { ICompanyRepository } from '../repositories/company.repository.interface';
import { Company, CompanyProps } from '../entities/company.entity';

export interface CreateCompanyRequest {
  name: string;
  rut: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export class CreateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(request: CreateCompanyRequest): Promise<Company> {
    // Create company
    const companyProps: CompanyProps = {
      name: request.name,
      rut: request.rut,
      address: request.address,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      contactEmail: request.contactEmail,
    };

    const company = Company.create(companyProps);

    return await this.companyRepository.create(company);
  }
}
