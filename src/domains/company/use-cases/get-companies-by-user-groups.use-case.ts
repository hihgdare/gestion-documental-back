import { ICompanyRepository } from '../repositories/company.repository.interface';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { Company } from '../entities/company.entity';

export class GetCompaniesByUserGroupsUseCase {
  constructor(
    private readonly companyRepository: ICompanyRepository,
    private readonly groupRepository: GroupRepository,
  ) {}

  public async execute(userId: string, isAdmin: boolean): Promise<Company[]> {
    // Get user's groups
    const userGroup = await this.groupRepository.findByUserId(userId);

    // If user has a group, return companies of that group
    if (userGroup) {
      const allCompanies = await this.companyRepository.findAll();
      const groupId = userGroup.id;
      const companiesInGroup = allCompanies.filter(company => company.groupId === String(groupId));
      return companiesInGroup;
    }

    // If user has no group but is admin, return all companies
    if (isAdmin) {
      return await this.companyRepository.findAll();
    }

    // If user has no group and is not admin, return empty list
    return [];
  }
}
