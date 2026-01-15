import { ICompanyRepository } from '../repositories/company.repository.interface';
import { Company } from '../entities/company.entity';
import { NotFoundError, ConflictError } from '@shared/domain/errors';

export interface UpdateCompanyRequest {
  name?: string;
  rut?: string;
}

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(id: string, request: UpdateCompanyRequest): Promise<Company> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa no encontrada');
    }

    // Check if RUT is being updated and if it already exists
    if (request.rut && request.rut !== company.rut) {
      const existingCompany = await this.companyRepository.findByRut(request.rut);
      if (existingCompany) {
        throw new ConflictError('Ya existe una empresa con este RUT');
      }
      company.updateRut(request.rut);
    }

    // Update name if provided
    if (request.name) {
      company.updateName(request.name);
    }

    return await this.companyRepository.update(company);
  }
}

export class DeleteCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(id: string): Promise<void> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa no encontrada');
    }

    company.softDelete();
    await this.companyRepository.update(company);
  }
}
