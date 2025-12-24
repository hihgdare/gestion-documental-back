import { IFamilyRepository } from '../repositories/family.repository.interface';
import { Family } from '../entities/family.entity';
import { NotFoundError, ConflictError } from '@shared/domain/errors';

export interface UpdateFamilyRequest {
  name: string;
}

export class UpdateFamilyUseCase {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  public async execute(id: string, request: UpdateFamilyRequest): Promise<Family> {
    const family = await this.familyRepository.findById(id);
    if (!family) {
      throw new NotFoundError('Familia no encontrada');
    }

    // Check if another family already exists with the same name
    const existingFamily = await this.familyRepository.findByName(request.name);
    if (existingFamily && existingFamily.id !== id) {
      throw new ConflictError('Ya existe una familia con este nombre');
    }

    family.updateName(request.name);

    return await this.familyRepository.update(family);
  }
}

export class DeleteFamilyUseCase {
  constructor(private readonly familyRepository: IFamilyRepository) {}

  public async execute(id: string): Promise<void> {
    const family = await this.familyRepository.findById(id);
    if (!family) {
      throw new NotFoundError('Familia no encontrada');
    }

    await this.familyRepository.softDelete(id);
  }
}
