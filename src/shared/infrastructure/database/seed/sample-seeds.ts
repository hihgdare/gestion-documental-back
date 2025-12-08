import { TypeOrmDocumentTypeRepository } from '@shared/infrastructure/repositories/typeorm-document-type.repository';
import { TypeOrmDocumentSubtypeRepository } from '@shared/infrastructure/repositories/typeorm-document-subtype.repository';
import { TypeOrmDocumentTemplateRepository } from '@shared/infrastructure/repositories/typeorm-document-template.repository';
import { TypeOrmColaboratorRepository } from '@shared/infrastructure/repositories/typeorm-colaborator.repository';
import { TypeOrmColaboratorGroupRepository } from '@shared/infrastructure/repositories/typeorm-colaborator-group.repository';
import { TypeOrmContractRepository } from '@shared/infrastructure/repositories/typeorm-contract.repository';
import { DocumentType as DocTypeDomain } from '@domains/document-type/entities/document-type.entity';
import { DocumentSubtype } from '@domains/document-subtype/entities/document-subtype.entity';
import { DocumentTemplate } from '@domains/document-template/entities/document-template.entity';
import { Colaborator } from '@domains/colaborators/entities/colaborator.entity';
import { DocumentType as ColabDocType, Gender, CivilStatus } from '@domains/colaborators/value-objects/colaborator-enums';
import { ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';

export async function runSampleSeeds(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const typeRepo = new TypeOrmDocumentTypeRepository();
  const subtypeRepo = new TypeOrmDocumentSubtypeRepository();
  const templateRepo = new TypeOrmDocumentTemplateRepository();
  const colaboratorRepo = new TypeOrmColaboratorRepository();
  const groupRepo = new TypeOrmColaboratorGroupRepository();
  const contractRepo = new TypeOrmContractRepository();

  const typeNames = ['Personal', 'Legal', 'Operacional'];
  const types: string[] = [];
  for (const name of typeNames) {
    const exists = await typeRepo.findByName(name);
    if (exists) {
      types.push(exists.id);
      continue;
    }
    const saved = await typeRepo.save(DocTypeDomain.create({ name }));
    types.push(saved.id);
  }

  const subtypeNames = ['Ficha', 'Acuerdo', 'Procedimiento'];
  const subtypes: string[] = [];
  for (let i = 0; i < subtypeNames.length; i++) {
    const name = subtypeNames[i];
    const typeId = types[i % types.length];
    const exists = await subtypeRepo.findByName(name);
    if (exists) {
      subtypes.push(exists.id);
      continue;
    }
    const saved = await subtypeRepo.save(DocumentSubtype.create({ name, documentTypeId: typeId }));
    subtypes.push(saved.id);
  }

  const templateNames = ['Plantilla Ficha', 'Plantilla Acuerdo', 'Plantilla Procedimiento'];
  for (let i = 0; i < templateNames.length; i++) {
    const name = templateNames[i];
    const exists = await templateRepo.findByName(name);
    if (exists) continue;
    const template = DocumentTemplate.create({
      name,
      description: null,
      documentTypeId: types[i % types.length],
      documentSubtypeId: subtypes[i % subtypes.length],
    });
    await templateRepo.save(template);
  }

  const colaboradoresData = [
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '11.111.111-1',
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'Gómez',
      nacionalidad: 'CL',
      sexo: Gender.MASCULINO,
      estadoCivil: CivilStatus.SOLTERO,
      fechaNacimiento: new Date('1990-01-01'),
      paisResidencia: 'CL',
      region: 'Metropolitana',
      comuna: 'Santiago',
      direccionResidencia: 'Av. Siempre Viva 123',
      telefono: '+56911111111',
      email: 'juan.perez@example.com',
      contactoEmergencia: 'María',
      telefonoEmergencia: '+56922222222',
      profesion: 'Ingeniero',
      cargo: 'Analista',
    },
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '22.222.222-2',
      nombre: 'María',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Soto',
      nacionalidad: 'CL',
      sexo: Gender.FEMENINO,
      estadoCivil: CivilStatus.CASADO,
      fechaNacimiento: new Date('1988-05-10'),
      paisResidencia: 'CL',
      region: 'Metropolitana',
      comuna: 'Providencia',
      direccionResidencia: 'Los Leones 456',
      telefono: '+56933333333',
      email: 'maria.lopez@example.com',
      contactoEmergencia: 'Juan',
      telefonoEmergencia: '+56944444444',
      profesion: 'Abogada',
      cargo: 'Consultora',
    },
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '33.333.333-3',
      nombre: 'Pedro',
      apellidoPaterno: 'Ramírez',
      apellidoMaterno: 'Fuentes',
      nacionalidad: 'CL',
      sexo: Gender.MASCULINO,
      estadoCivil: CivilStatus.SOLTERO,
      fechaNacimiento: new Date('1995-09-20'),
      paisResidencia: 'CL',
      region: 'Valparaíso',
      comuna: 'Viña del Mar',
      direccionResidencia: 'Av. Libertad 789',
      telefono: '+56955555555',
      email: 'pedro.ramirez@example.com',
      contactoEmergencia: 'Sofía',
      telefonoEmergencia: '+56966666666',
      profesion: 'Técnico',
      cargo: 'Operario',
    },
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '44.444.444-4',
      nombre: 'Ana',
      apellidoPaterno: 'Rojas',
      apellidoMaterno: 'Vega',
      nacionalidad: 'CL',
      sexo: Gender.FEMENINO,
      estadoCivil: CivilStatus.SOLTERO,
      fechaNacimiento: new Date('1992-03-12'),
      paisResidencia: 'CL',
      region: 'Biobío',
      comuna: 'Concepción',
      direccionResidencia: 'Calle Nueva 12',
      telefono: '+56977777777',
      email: 'ana.rojas@example.com',
      contactoEmergencia: 'Carlos',
      telefonoEmergencia: '+56988888888',
      profesion: 'Diseñadora',
      cargo: 'UX',
    },
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '55.555.555-5',
      nombre: 'Carlos',
      apellidoPaterno: 'Silva',
      apellidoMaterno: 'Paredes',
      nacionalidad: 'CL',
      sexo: Gender.MASCULINO,
      estadoCivil: CivilStatus.SOLTERO,
      fechaNacimiento: new Date('1991-07-22'),
      paisResidencia: 'CL',
      region: 'Metropolitana',
      comuna: 'Ñuñoa',
      direccionResidencia: 'Los Alerces 321',
      telefono: '+56999999999',
      email: 'carlos.silva@example.com',
      contactoEmergencia: 'Ana',
      telefonoEmergencia: '+56900000000',
      profesion: 'Desarrollador',
      cargo: 'Backend',
    },
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '66.666.666-6',
      nombre: 'Sofía',
      apellidoPaterno: 'Martínez',
      apellidoMaterno: 'Díaz',
      nacionalidad: 'CL',
      sexo: Gender.FEMENINO,
      estadoCivil: CivilStatus.CASADO,
      fechaNacimiento: new Date('1989-11-05'),
      paisResidencia: 'CL',
      region: 'Los Lagos',
      comuna: 'Puerto Montt',
      direccionResidencia: 'Av. Austral 456',
      telefono: '+56912121212',
      email: 'sofia.martinez@example.com',
      contactoEmergencia: 'Diego',
      telefonoEmergencia: '+56913131313',
      profesion: 'Analista',
      cargo: 'QA',
    },
    {
      tipoDocumento: ColabDocType.RUT,
      numeroDocumento: '77.777.777-7',
      nombre: 'Diego',
      apellidoPaterno: 'Torres',
      apellidoMaterno: 'Campos',
      nacionalidad: 'CL',
      sexo: Gender.MASCULINO,
      estadoCivil: CivilStatus.SOLTERO,
      fechaNacimiento: new Date('1993-02-17'),
      paisResidencia: 'CL',
      region: 'Coquimbo',
      comuna: 'La Serena',
      direccionResidencia: 'Calle Sol 789',
      telefono: '+56923232323',
      email: 'diego.torres@example.com',
      contactoEmergencia: 'Sofía',
      telefonoEmergencia: '+56934343434',
      profesion: 'Project Manager',
      cargo: 'PM',
    },
  ];

  const colaboratorIds: string[] = [];
  for (const c of colaboradoresData) {
    const exists = await colaboratorRepo.findByEmail(c.email);
    if (exists) {
      colaboratorIds.push(exists.id);
      continue;
    }
    const saved = await colaboratorRepo.save(Colaborator.create(c));
    colaboratorIds.push(saved.id);
  }

  const groupNames = ['Equipo A', 'Equipo B', 'Equipo C'];
  const groups: { id: number; name: string; description?: string }[] = [];
  for (const name of groupNames) {
    let found = await groupRepo.findByName(name);
    if (!found) {
      const created = await groupRepo.save({ name, description: 'Grupo de prueba', colaborators: [] as any });
      found = created;
    }
    groups.push({ id: (found as any).id, name: found!.name, description: (found as any).description });
  }

  const [A, B, C] = groups;
  const cids = colaboratorIds;
  if (cids.length >= 7) {
    const groupAColabs = [cids[0], cids[3], cids[4], cids[5]];
    const groupBColabs = [cids[1], cids[3], cids[4], cids[6]];
    const groupCColabs = [cids[2], cids[3], cids[5], cids[6]];

    await groupRepo.update({ id: A.id, name: A.name, description: A.description, colaborators: groupAColabs.map(id => ({ id } as any)) });
    await groupRepo.update({ id: B.id, name: B.name, description: B.description, colaborators: groupBColabs.map(id => ({ id } as any)) });
    await groupRepo.update({ id: C.id, name: C.name, description: C.description, colaborators: groupCColabs.map(id => ({ id } as any)) });
  }

  const today = new Date();
  const contractsData = [
    {
      rutSociedad: '12.345.678-5',
      nombreColaborador: 'Empresa X',
      administradorContratoMandante: 'Admin Mandante',
      administradorContratoEmpresa: 'Admin Empresa',
      rutAdministradorContrato: '23.456.789-6',
      contractNumber: `CN-DEV-${Date.now()}-1`,
      nombreMandante: 'Mandante SA',
      startDate: today.toISOString().slice(0, 10),
      endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      contractType: ContractType.CONSULTORIA,
      jornadaTrabajo: JornadaTrabajo.COMPLETA,
    },
    {
      rutSociedad: '98.765.432-1',
      nombreColaborador: 'Empresa Y',
      administradorContratoMandante: 'Admin Mandante',
      administradorContratoEmpresa: 'Admin Empresa',
      rutAdministradorContrato: '65.432.109-8',
      contractNumber: `CN-DEV-${Date.now()}-2`,
      nombreMandante: 'Mandante SPA',
      startDate: today.toISOString().slice(0, 10),
      endDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      contractType: ContractType.HONORARIOS,
      jornadaTrabajo: JornadaTrabajo.PARCIAL,
    },
    {
      rutSociedad: '77.777.777-7',
      nombreColaborador: 'Empresa Z',
      administradorContratoMandante: 'Admin Mandante',
      administradorContratoEmpresa: 'Admin Empresa',
      rutAdministradorContrato: '11.111.111-1',
      contractNumber: `CN-DEV-${Date.now()}-3`,
      nombreMandante: 'Mandante Ltda',
      startDate: today.toISOString().slice(0, 10),
      endDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      contractType: ContractType.OBRA_FAENA,
      jornadaTrabajo: JornadaTrabajo.TURNO,
    },
  ];

  for (const c of contractsData) {
    const exists = await contractRepo.findByContractNumber(c.contractNumber);
    if (exists) continue;
    await contractRepo.save(c as any);
  }
}
