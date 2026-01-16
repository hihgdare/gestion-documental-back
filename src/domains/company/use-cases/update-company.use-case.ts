import { ICompanyRepository } from '../repositories/company.repository.interface';
import { Company } from '../entities/company.entity';
import { NotFoundError } from '@shared/domain/errors';

export interface UpdateCompanyRequest {
  name?: string;
  rut?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export class UpdateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  public async execute(id: string, request: UpdateCompanyRequest): Promise<Company> {
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError('Empresa no encontrada');
    }

    // Update RUT if provided
    if (request.rut && request.rut !== company.rut) {
      company.updateRut(request.rut);
    }

    // Update name if provided
    if (request.name) {
      company.updateName(request.name);
    }

    // Update address if provided
    if (request.address !== undefined) {
      company.updateAddress(request.address);
    }

    // Update contact info if provided
    if (request.contactName !== undefined) {
      company.updateContactName(request.contactName);
    }

    if (request.contactPhone !== undefined) {
      company.updateContactPhone(request.contactPhone);
    }

    if (request.contactEmail !== undefined) {
      company.updateContactEmail(request.contactEmail);
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
