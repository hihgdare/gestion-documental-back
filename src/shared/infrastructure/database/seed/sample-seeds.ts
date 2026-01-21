import { TypeOrmDocumentTypeRepository } from '@shared/infrastructure/repositories/typeorm-document-type.repository';
import { TypeOrmDocumentSubtypeRepository } from '@shared/infrastructure/repositories/typeorm-document-subtype.repository';
import { TypeOrmColaboratorRepository } from '@shared/infrastructure/repositories/typeorm-colaborator.repository';
import { TypeOrmColaboratorGroupRepository } from '@shared/infrastructure/repositories/typeorm-colaborator-group.repository';
import { TypeOrmGroupRepository } from '@shared/infrastructure/repositories/typeorm-group.repository';
import { TypeOrmContractRepository } from '@shared/infrastructure/repositories/typeorm-contract.repository';
import { TypeOrmDocumentRepository } from '@shared/infrastructure/repositories/typeorm-document.repository';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';
import { DocumentType as DocTypeDomain } from '@domains/document-type/entities/document-type.entity';
import { DocumentSubtype } from '@domains/document-subtype/entities/document-subtype.entity';
import { Colaborator, ColaboratorProps } from '@domains/colaborators/entities/colaborator.entity';
import { Document } from '@domains/document/entities/document.entity';
import { File } from '@domains/file/entities/file.entity';
import { DocumentType as ColabDocType, Gender, CivilStatus } from '@domains/colaborators/value-objects/colaborator-enums';
import { ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';
import { DocumentStatus } from '@domains/document/value-objects/document-enums';
import { StorageType } from '@domains/file/value-objects/storage-type';
import * as fs from 'fs';
import * as path from 'path';

export async function runSampleSeeds(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;

  const typeRepo = new TypeOrmDocumentTypeRepository();
  const subtypeRepo = new TypeOrmDocumentSubtypeRepository();
  const colaboratorRepo = new TypeOrmColaboratorRepository();
  const colaboratorGroupRepo = new TypeOrmColaboratorGroupRepository();
  const groupRepo = new TypeOrmGroupRepository();
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

  /* Create Group */
  let testGroup = await groupRepo.findById(1);
  if (!testGroup) {
    testGroup = await groupRepo.save({
      name: 'Grupo de Pruebas',
      description: 'Grupo de pruebas',
    });
  }

  /* Create Contracts */
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
      groupId: 1,
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
      groupId: 1,
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
      groupId: 1,
    },
  ];

  const contractIds: string[] = [];
  for (const c of contractsData) {
    let contract = await contractRepo.findByContractNumber(c.contractNumber);
    if (!contract) {
      contract = await contractRepo.save(c as any);
    }
    contractIds.push(contract.id);
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
      groupId: 1,
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
      groupId: 1,
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
      groupId: 1,
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
      groupId: 1,
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
      groupId: 1,
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
      groupId: 1,
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
      groupId: 1,
    },
  ] satisfies ColaboratorProps[];

  const colaboratorIds: string[] = [];
  for (let i = 0; i < colaboradoresData.length; i++) {
    const c = colaboradoresData[i];
    const exists = await colaboratorRepo.findByEmail(c.email);
    if (exists) {
      colaboratorIds.push(exists.id);
      continue;
    }
    const saved = await colaboratorRepo.save(Colaborator.create({
      ...c,
      contractIds: [contractIds[i % contractIds.length]],
    }));
    colaboratorIds.push(saved.id);
  }

  /* Create Colaborator Groups */
  const groupNames = ['Equipo A', 'Equipo B', 'Equipo C'];
  const groups: { id: number; name: string; description?: string }[] = [];
  let groupIndex = 0;
  for (const name of groupNames) {
    let found = await colaboratorGroupRepo.findByName(name);
    if (!found) {
      // Assign specific contract based on index rotation
      const assignedContractId = contractIds[groupIndex % contractIds.length];
      const created = await colaboratorGroupRepo.save({
        name,
        description: 'Grupo de prueba',
        colaborators: [] as any,
        contractId: assignedContractId,
      });
      found = created;
    }
    groups.push({ id: (found as any).id, name: found!.name, description: (found as any).description });
    groupIndex++;
  }

  const [A, B, C] = groups;
  const cids = colaboratorIds;
  if (cids.length >= 7 && groups.length >= 3) {
    const groupAColabs = [cids[0], cids[3], cids[4], cids[5]];
    const groupBColabs = [cids[1], cids[3], cids[4], cids[6]];
    const groupCColabs = [cids[2], cids[3], cids[5], cids[6]];

    await colaboratorGroupRepo.update({ id: A.id, colaborators: groupAColabs.map(id => ({ id } as any)) });
    await colaboratorGroupRepo.update({ id: B.id, colaborators: groupBColabs.map(id => ({ id } as any)) });
    await colaboratorGroupRepo.update({ id: C.id, colaborators: groupCColabs.map(id => ({ id } as any)) });
  }

  /* Create Documents with different statuses */
  const documentRepo = new TypeOrmDocumentRepository();
  const fileRepo = new TypeOrmFileRepository();
  const userRepo = new TypeOrmUserRepository();

  // Get first user to use as createdBy
  const users = await userRepo.findAll();
  const createdById = users.length > 0 ? users[0].id : null;

  // Helper function to copy test files to uploads folder
  const copyTestFile = async (testFileName: string, destinationFileName: string): Promise<File> => {
    const testsDir = path.join(process.cwd(), 'tests');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const sourcePath = path.join(testsDir, testFileName);
    const destPath = path.join(uploadsDir, destinationFileName);

    fs.copyFileSync(sourcePath, destPath);

    const stats = fs.statSync(destPath);
    const mimeType = testFileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';

    const file = new File({
      originalName: testFileName,
      path: `uploads/${destinationFileName}`,
      storage: 'local' as StorageType,
      mimeType,
      size: stats.size,
    });

    return await fileRepo.save(file);
  };

  const documentsData = [
    {
      name: 'Documento en Borrador',
      documentTypeId: types[0],
      documentSubtypeId: subtypes[0],
      contractId: contractIds[0],
      colaboratorIds: [colaboratorIds[0], colaboratorIds[1]],
      description: 'Documento de prueba en estado borrador',
      status: DocumentStatus.DRAFT,
      issuedDate: today,
      expirationDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
      requiredForContract: true,
      requiredForColaborator: false,
      createdBy: createdById,
      groupId: 1,
    },
    {
      name: 'Documento en Revisión',
      documentTypeId: types[1],
      documentSubtypeId: subtypes[1],
      contractId: contractIds[1],
      colaboratorIds: [colaboratorIds[2], colaboratorIds[3]],
      description: 'Documento de prueba en estado de revisión',
      status: DocumentStatus.IN_REVIEW,
      issuedDate: today,
      expirationDate: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000),
      requiredForContract: false,
      requiredForColaborator: true,
      createdBy: createdById,
      groupId: 1,
      testFile: 'test-document-1.pdf',
    },
    {
      name: 'Documento Aprobado',
      documentTypeId: types[2],
      documentSubtypeId: subtypes[2],
      contractId: contractIds[2],
      colaboratorIds: [colaboratorIds[4], colaboratorIds[5]],
      description: 'Documento de prueba aprobado',
      status: DocumentStatus.APPROVED,
      issuedDate: today,
      expirationDate: new Date(today.getTime() + 730 * 24 * 60 * 60 * 1000),
      requiredForContract: true,
      requiredForColaborator: true,
      createdBy: createdById,
      groupId: 1,
      testFile: 'test-document-2.pdf',
    },
    {
      name: 'Documento Rechazado',
      documentTypeId: types[0],
      documentSubtypeId: subtypes[0],
      contractId: contractIds[0],
      colaboratorIds: [colaboratorIds[6]],
      description: 'Documento de prueba rechazado',
      status: DocumentStatus.REJECTED,
      issuedDate: today,
      expirationDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000),
      requiredForContract: false,
      requiredForColaborator: false,
      createdBy: createdById,
      groupId: 1,
      comment: 'Rechazado por incumplir requisitos',
      testFile: 'test-document-3.pdf',
    },
    {
      name: 'Documento Rechazado con Comentarios',
      documentTypeId: types[1],
      documentSubtypeId: subtypes[1],
      contractId: contractIds[1],
      colaboratorIds: [colaboratorIds[0], colaboratorIds[3]],
      description: 'Documento rechazado con comentarios para corrección',
      status: DocumentStatus.REJECTED_WITH_COMMENTS,
      issuedDate: today,
      expirationDate: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000),
      requiredForContract: true,
      requiredForColaborator: false,
      createdBy: createdById,
      groupId: 1,
      comment: 'Favor revisar las firmas y volver a enviar',
      testFile: 'test-image-1.jpg',
    },
    {
      name: 'Documento Expirado',
      documentTypeId: types[2],
      documentSubtypeId: subtypes[2],
      contractId: contractIds[2],
      colaboratorIds: [colaboratorIds[1], colaboratorIds[4]],
      description: 'Documento que ya ha expirado',
      status: DocumentStatus.EXPIRED,
      issuedDate: new Date(today.getTime() - 400 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      requiredForContract: false,
      requiredForColaborator: true,
      createdBy: createdById,
      groupId: 1,
      testFile: 'test-image-2.png',
    },
    {
      name: 'Documento Obsoleto',
      documentTypeId: types[0],
      documentSubtypeId: subtypes[0],
      contractId: contractIds[0],
      colaboratorIds: [colaboratorIds[2], colaboratorIds[5]],
      description: 'Documento marcado como obsoleto',
      status: DocumentStatus.OBSOLETE,
      issuedDate: new Date(today.getTime() - 200 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(today.getTime() + 100 * 24 * 60 * 60 * 1000),
      requiredForContract: false,
      requiredForColaborator: false,
      createdBy: createdById,
      groupId: 1,
      testFile: 'test-document-1.pdf',
    },
    {
      name: 'Documento Archivado',
      documentTypeId: types[1],
      documentSubtypeId: subtypes[1],
      contractId: contractIds[1],
      colaboratorIds: [colaboratorIds[3], colaboratorIds[6]],
      description: 'Documento archivado para registro histórico',
      status: DocumentStatus.ARCHIVED,
      issuedDate: new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000),
      expirationDate: null,
      requiredForContract: true,
      requiredForColaborator: true,
      createdBy: createdById,
      groupId: 1,
      testFile: 'test-document-2.pdf',
    },
  ];

  for (const docData of documentsData) {
    const { testFile, ...documentProps } = docData as any;

    // Check if document already exists by name
    const existing = await documentRepo.findAll(undefined, { contractId: documentProps.contractId });
    if (existing.some(d => d.name === documentProps.name)) {
      // console.log(`  ⏭️  Documento "${documentProps.name}" ya existe, omitiendo...`);
      continue;
    }

    // Create the document
    const document = Document.create(documentProps);
    const savedDocument = await documentRepo.save(document);

    // Attach file if status is not DRAFT
    if (testFile && documentProps.status !== DocumentStatus.DRAFT) {
      const fileExtension = path.extname(testFile);
      const destinationFileName = `${savedDocument.id}${fileExtension}`;

      try {
        const file = await copyTestFile(testFile, destinationFileName);

        // Update document with file ID (not path)
        savedDocument.documentUrl = file.id;
        await documentRepo.update(savedDocument);

        // console.log(`  ✅ Documento "${documentProps.name}" creado con archivo adjunto`);
      } catch (_error) {
        // console.log(`  ⚠️  Documento "${documentProps.name}" creado pero no se pudo adjuntar archivo:`, error);
      }
    } else {
      // console.log(`  ✅ Documento "${documentProps.name}" creado (sin archivo)`);
    }
  }
}
