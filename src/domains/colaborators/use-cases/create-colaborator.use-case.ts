import { ColaboratorRepository } from '../repositories/colaborator.repository';
import { Colaborator, ColaboratorProps } from '../entities/colaborator.entity';
import { DocumentType, Gender, CivilStatus } from '../value-objects/colaborator-enums';
import { ConflictError } from '@shared/domain/errors';

export interface CreateColaboratorRequest {
  tipoDocumento: DocumentType;
  numeroDocumento: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nacionalidad: string;
  sexo: Gender;
  estadoCivil: CivilStatus;
  fechaNacimiento: Date;
  paisResidencia: string;
  region?: string;
  comuna?: string;
  estadoRegion?: string;
  ciudadMunicipio?: string;
  direccionResidencia: string;
  telefono: string;
  email: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  profesion: string;
  cargo: string;
}

export class CreateColaboratorUseCase {
  constructor(private readonly colaboratorRepository: ColaboratorRepository) {}

  public async execute(request: CreateColaboratorRequest): Promise<Colaborator> {
    // Check if document number already exists
    const existingByDocument = await this.colaboratorRepository.findByNumeroDocumento(request.numeroDocumento);
    if (existingByDocument) {
      throw new ConflictError('Colaborator with this document number already exists');
    }

    // Check if email already exists
    const existingByEmail = await this.colaboratorRepository.findByEmail(request.email);
    if (existingByEmail) {
      throw new ConflictError('Colaborator with this email already exists');
    }

    const colaboratorProps: ColaboratorProps = {
      ...request,
      fechaNacimiento: new Date(request.fechaNacimiento),
    };

    const colaborator = Colaborator.create(colaboratorProps);
    
    return await this.colaboratorRepository.save(colaborator);
  }
}
