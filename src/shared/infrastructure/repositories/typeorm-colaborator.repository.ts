import { Repository } from 'typeorm';
import { ColaboratorRepository } from '@domains/colaborators/repositories/colaborator.repository';
import { Colaborator, ColaboratorProps } from '@domains/colaborators/entities/colaborator.entity';
import {
  ColaboratorStatus,
  DocumentType,
  Gender,
  CivilStatus,
} from '@domains/colaborators/value-objects/colaborator-enums';
import { ColaboratorEntity } from '../database/entities/colaborators.entity';
import { AppDataSource } from '../database/typeorm.config';

export class TypeOrmColaboratorRepository implements ColaboratorRepository {
  private repository: Repository<ColaboratorEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ColaboratorEntity);
  }

  async findById(id: string): Promise<Colaborator | null> {
    const colaboratorEntity = await this.repository.findOne({ where: { id } });
    if (!colaboratorEntity) return null;
    return this.toDomain(colaboratorEntity);
  }

  async findAll(): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async save(colaborator: Colaborator): Promise<Colaborator> {
    const colaboratorEntity = this.toEntity(colaborator);
    const savedEntity = await this.repository.save(colaboratorEntity);
    return this.toDomain(savedEntity);
  }

  async update(colaborator: Colaborator): Promise<Colaborator> {
    const colaboratorEntity = this.toEntity(colaborator);
    await this.repository.update(colaborator.id, colaboratorEntity);
    const updatedEntity = await this.repository.findOne({ where: { id: colaborator.id } });
    return this.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByNumeroDocumento(numeroDocumento: string): Promise<Colaborator | null> {
    const colaboratorEntity = await this.repository.findOne({
      where: { numeroDocumento },
    });
    if (!colaboratorEntity) return null;
    return this.toDomain(colaboratorEntity);
  }

  async findByEmail(email: string): Promise<Colaborator | null> {
    const colaboratorEntity = await this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!colaboratorEntity) return null;
    return this.toDomain(colaboratorEntity);
  }

  async findByNombre(nombre: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { nombre },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: ColaboratorStatus): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByDocumentType(tipo: DocumentType): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { tipoDocumento: tipo },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByNacionalidad(nacionalidad: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { nacionalidad },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByPaisResidencia(pais: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { paisResidencia: pais },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByRegion(region: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { region },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByComuna(comuna: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { comuna },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findByCargo(cargo: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { cargo },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async findActiveColaborators(): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository.find({
      where: { status: ColaboratorStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  async searchByName(searchTerm: string): Promise<Colaborator[]> {
    const colaboratorEntities = await this.repository
      .createQueryBuilder('colaborator')
      .where('colaborator.nombre ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('colaborator.apellidoPaterno ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('colaborator.apellidoMaterno ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orderBy('colaborator.createdAt', 'DESC')
      .getMany();

    return colaboratorEntities.map(entity => this.toDomain(entity));
  }

  private toDomain(entity: ColaboratorEntity): Colaborator {
    const props: ColaboratorProps = {
      id: entity.id,
      tipoDocumento: entity.tipoDocumento as DocumentType,
      numeroDocumento: entity.numeroDocumento,
      nombre: entity.nombre,
      apellidoPaterno: entity.apellidoPaterno,
      apellidoMaterno: entity.apellidoMaterno,
      nacionalidad: entity.nacionalidad,
      sexo: entity.sexo as Gender,
      estadoCivil: entity.estadoCivil as CivilStatus,
      fechaNacimiento: entity.fechaNacimiento instanceof Date
        ? entity.fechaNacimiento
        : new Date(entity.fechaNacimiento),
      paisResidencia: entity.paisResidencia,
      region: entity.region,
      comuna: entity.comuna,
      estadoRegion: entity.estadoRegion,
      ciudadMunicipio: entity.ciudadMunicipio,
      direccionResidencia: entity.direccionResidencia,
      telefono: entity.telefono,
      email: entity.email,
      contactoEmergencia: entity.contactoEmergencia,
      telefonoEmergencia: entity.telefonoEmergencia,
      profesion: entity.profesion,
      cargo: entity.cargo,
      status: entity.status as ColaboratorStatus,
      createdAt: entity.createdAt instanceof Date
        ? entity.createdAt
        : new Date(entity.createdAt),
      updatedAt: entity.updatedAt instanceof Date
        ? entity.updatedAt
        : new Date(entity.updatedAt),
    };
    return Colaborator.fromPersistence(props);
  }

  private toEntity(colaborator: Colaborator): Partial<ColaboratorEntity> {
    return {
      id: colaborator.id,
      tipoDocumento: colaborator.tipoDocumento,
      numeroDocumento: colaborator.numeroDocumento,
      nombre: colaborator.nombre,
      apellidoPaterno: colaborator.apellidoPaterno,
      apellidoMaterno: colaborator.apellidoMaterno,
      nacionalidad: colaborator.nacionalidad,
      sexo: colaborator.sexo,
      estadoCivil: colaborator.estadoCivil,
      fechaNacimiento: colaborator.fechaNacimiento,
      paisResidencia: colaborator.paisResidencia,
      region: colaborator.region,
      comuna: colaborator.comuna,
      estadoRegion: colaborator.estadoRegion,
      ciudadMunicipio: colaborator.ciudadMunicipio,
      direccionResidencia: colaborator.direccionResidencia,
      telefono: colaborator.telefono,
      email: colaborator.email,
      contactoEmergencia: colaborator.contactoEmergencia,
      telefonoEmergencia: colaborator.telefonoEmergencia,
      profesion: colaborator.profesion,
      cargo: colaborator.cargo,
      status: colaborator.status,
      createdAt: colaborator.createdAt,
      updatedAt: colaborator.updatedAt,
    };
  }
}
