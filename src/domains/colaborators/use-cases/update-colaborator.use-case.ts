import { ColaboratorRepository } from '../repositories/colaborator.repository';
import { Colaborator } from '../entities/colaborator.entity';
import { NotFoundError, ConflictError } from '@shared/domain/errors';

export interface UpdateColaboratorRequest {
  id: string;
  telefono?: string;
  email?: string;
  direccionResidencia?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  cargo?: string;
  region?: string;
  comuna?: string;
  estadoRegion?: string;
  ciudadMunicipio?: string;
}

export class UpdateColaboratorUseCase {
  constructor(private readonly colaboratorRepository: ColaboratorRepository) {}

  public async execute(request: UpdateColaboratorRequest): Promise<Colaborator> {
    const colaborator = await this.colaboratorRepository.findById(request.id);
    
    if (!colaborator) {
      throw new NotFoundError(`Colaborator with id ${request.id} not found`);
    }

    // If email is being updated, check if it's already in use
    if (request.email && request.email !== colaborator.email) {
      const existingByEmail = await this.colaboratorRepository.findByEmail(request.email);
      if (existingByEmail) {
        throw new ConflictError('Email is already in use by another colaborator');
      }
    }

    // Update contact info if provided
    if (request.telefono || request.email) {
      colaborator.updateContactInfo(
        request.telefono || colaborator.telefono,
        request.email || colaborator.email
      );
    }

    // Update address if provided
    if (request.direccionResidencia) {
      colaborator.updateDireccion(request.direccionResidencia);
    }

    // Update emergency contact if provided
    if (request.contactoEmergencia !== undefined || request.telefonoEmergencia !== undefined) {
      colaborator.updateEmergencyContact(
        request.contactoEmergencia,
        request.telefonoEmergencia
      );
    }

    // Update cargo if provided
    if (request.cargo) {
      colaborator.updateCargo(request.cargo);
    }

    return await this.colaboratorRepository.update(colaborator);
  }

  public async activate(id: string): Promise<Colaborator> {
    const colaborator = await this.colaboratorRepository.findById(id);
    
    if (!colaborator) {
      throw new NotFoundError(`Colaborator with id ${id} not found`);
    }

    colaborator.activate();
    
    return await this.colaboratorRepository.update(colaborator);
  }

  public async suspend(id: string): Promise<Colaborator> {
    const colaborator = await this.colaboratorRepository.findById(id);
    
    if (!colaborator) {
      throw new NotFoundError(`Colaborator with id ${id} not found`);
    }

    colaborator.suspend();
    
    return await this.colaboratorRepository.update(colaborator);
  }

  public async deactivate(id: string): Promise<Colaborator> {
    const colaborator = await this.colaboratorRepository.findById(id);
    
    if (!colaborator) {
      throw new NotFoundError(`Colaborator with id ${id} not found`);
    }

    colaborator.deactivate();
    
    return await this.colaboratorRepository.update(colaborator);
  }

  public async terminate(id: string): Promise<Colaborator> {
    const colaborator = await this.colaboratorRepository.findById(id);
    
    if (!colaborator) {
      throw new NotFoundError(`Colaborator with id ${id} not found`);
    }

    colaborator.terminate();
    
    return await this.colaboratorRepository.update(colaborator);
  }
}
