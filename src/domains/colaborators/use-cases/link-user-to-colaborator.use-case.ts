import { ColaboratorRepository } from '../repositories/colaborator.repository';
import { Colaborator } from '../entities/colaborator.entity';
import { UserRepository } from '@domains/user/repositories/user.repository';
import { NotFoundError, ConflictError } from '@shared/domain/errors';

export class LinkUserToColaboratorUseCase {
  constructor(
    private readonly colaboratorRepository: ColaboratorRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Assigns a user to a colaborator (0..1:0..1).
   * Pass userId=null to unlink.
   */
  async execute(colaboratorId: string, userId: string | null): Promise<Colaborator> {
    const colaborator = await this.colaboratorRepository.findById(colaboratorId);
    if (!colaborator) {
      throw new NotFoundError(`Colaborator with id ${colaboratorId} not found`);
    }

    if (userId === null) {
      colaborator.unlinkUser();
      return this.colaboratorRepository.update(colaborator);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    // Ensure the target user is not already linked to a different colaborator
    const existingColaborator = await this.colaboratorRepository.findByUserId(userId);
    if (existingColaborator && existingColaborator.id !== colaboratorId) {
      throw new ConflictError(`User is already linked to another colaborator`);
    }

    colaborator.linkUser(userId);
    return this.colaboratorRepository.update(colaborator);
  }
}
