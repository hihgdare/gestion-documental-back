import { IFamilyRepository } from '../repositories/family.repository.interface';
import { Family, FamilyProps } from '../entities/family.entity';
import { ConflictError } from '@shared/domain/errors';

export interface CreateFamilyRequest {
  name: string;
}

export class CreateFamilyUseCase {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  public async execute(request: CreateFamilyRequest): Promise<Family> {
    // Check if family already exists with the same name
    const existingFamily = await this.familyRepository.findByName(request.name);
    if (existingFamily) {
      throw new ConflictError('Ya existe una familia con este nombre');
    }

    // Create family
    const familyProps: FamilyProps = {
      name: request.name,
    };

    const family = Family.create(familyProps);

    return await this.familyRepository.create(family);
  }
}
