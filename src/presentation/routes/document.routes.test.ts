/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';

describe('DocumentController with type/subtype/colaborator', () => {
  let appInstance: App;
  let app: Application;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'false';
    process.env.SHOW_DB_QUERY = 'true';
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);
  });

  async function createTypeAndSubtype() {
    const typeRes = await supertest(app)
      .post('/api/documents/types')
      .set('x-enable-rbac', 'false')
      .send({ name: `Type ${Date.now()}` });
    const typeId = typeRes.body.data.id as string;

    const subtypeRes = await supertest(app)
      .post('/api/documents/subtypes')
      .set('x-enable-rbac', 'false')
      .send({ name: `Subtype ${Date.now()}`, documentTypeId: typeId });
    const subtypeId = subtypeRes.body.data.id as string;

    return { typeId, subtypeId };
  }

  async function createContract() {
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const contractDto = {
      rutSociedad: '12.345.678-5',
      nombreColaborador: 'Test Colaborador',
      administradorContratoMandante: 'Admin M',
      administradorContratoEmpresa: 'Admin E',
      rutAdministradorContrato: '23.456.789-6',
      contractNumber: `CN-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
      nombreMandante: 'Mandante SA',
      startDate,
      endDate,
      contractType: 'consultoria',
      jornadaTrabajo: 'completa',
    };
    const res = await supertest(app)
      .post('/api/contracts')
      .set('x-enable-rbac', 'false')
      .send(contractDto);
    expect(res.status).toBe(201);
    return res.body.data.id as string;
  }

  async function createColaborator() {
    const base = `${Date.now()}-${Math.random().toString(16).slice(2,8)}`;
    const contractId = await createContract();
    const res = await supertest(app)
      .post('/api/colaborators')
      .set('x-enable-rbac', 'false')
      .send({
        tipoDocumento: 'rut',
        numeroDocumento: `12345678-${base}`,
        nombre: 'Juan',
        apellidoPaterno: 'Perez',
        apellidoMaterno: 'Gomez',
        nacionalidad: 'Chilena',
        sexo: 'masculino',
        estadoCivil: 'soltero',
        fechaNacimiento: '1990-01-01',
        paisResidencia: 'CL',
        region: 'RM',
        comuna: 'Santiago',
        direccionResidencia: 'Av. Siempre Viva 123',
        telefono: '123456789',
        email: `juan-${base}@example.com`,
        profesion: 'Ingeniero',
        cargo: 'Analista',
        contractIds: [contractId],
      });
    expect(res.status).toBe(201);
    return res.body.data.id as string;
  }

  describe('/api/documents', () => {
    it('should create a document with type/subtype and colaborator', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();
      const colaboratorId = await createColaborator();

      const response = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({
          documentTypeId: typeId,
          documentSubtypeId: subtypeId,
          colaboratorIds: [colaboratorId],
          name: 'Documento de Prueba',
          issuedDate: '2025-01-01',
          description: 'Desc',
        });
      if (response.status !== 201) {
        console.log('Create error:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Document created successfully');
      expect(response.body.data.documentTypeId).toBe(typeId);
      expect(response.body.data.documentSubtypeId).toBe(subtypeId);
      expect(response.body.data.colaboratorIds).toContain(colaboratorId);
    });

    it('should list documents by type/subtype and by colaborator', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();
      const colaboratorId = await createColaborator();

      await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({
          documentTypeId: typeId,
          documentSubtypeId: subtypeId,
          colaboratorIds: [colaboratorId],
          name: 'Documento A',
          issuedDate: '2025-01-01',
        });

      const byTypeSubtype = await supertest(app)
        .get(`/api/documents/by-type-subtype/${typeId}/${subtypeId}`)
        .set('x-enable-rbac', 'false');
      expect(byTypeSubtype.status).toBe(200);
      expect(byTypeSubtype.body.success).toBe(true);
      expect(byTypeSubtype.body.count).toBeGreaterThanOrEqual(1);

      const byColab = await supertest(app)
        .get(`/api/documents/by-colaborator/${colaboratorId}`)
        .set('x-enable-rbac', 'false');
      expect(byColab.status).toBe(200);
      expect(byColab.body.success).toBe(true);
      expect(byColab.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should update a document fields', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();
      const colaboratorId = await createColaborator();

      const createRes = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, colaboratorIds: [colaboratorId], name: 'Doc Edit', issuedDate: '2025-01-01' });
      const id = createRes.body.data.id as string;

      const updateRes = await supertest(app)
        .put(`/api/documents/${id}`)
        .set('x-enable-rbac', 'false')
        .send({ name: 'Doc Edit Updated', comment: 'Cambio' });
      if (updateRes.status !== 200) {
        console.log('Update error:', updateRes.body);
      }

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.message).toBe('Document updated successfully');
      expect(updateRes.body.data.name).toBe('Doc Edit Updated');
    });

    it('should not allow duplicate type+subtype+colaborator on create', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();
      const colaboratorId = await createColaborator();

      const first = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, colaboratorIds: [colaboratorId], name: 'Doc1', issuedDate: '2025-01-01' });
      expect(first.status).toBe(201);

      const dup = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, colaboratorIds: [colaboratorId], name: 'Doc2', issuedDate: '2025-01-02' });
      expect(dup.status).toBe(400);
      expect(dup.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should not allow duplicate type+subtype+colaborator on update', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();
      const colaboratorId = await createColaborator();
      const otherTypeSubtype = await createTypeAndSubtype();

      await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, colaboratorIds: [colaboratorId], name: 'DocA', issuedDate: '2025-01-01' });
      const b = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: otherTypeSubtype.typeId, documentSubtypeId: otherTypeSubtype.subtypeId, colaboratorIds: [colaboratorId], name: 'DocB', issuedDate: '2025-01-01' });
      const bId = b.body.data.id as string;

      const dupUpdate = await supertest(app)
        .put(`/api/documents/${bId}`)
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, comment: 'try duplicate' });
      expect(dupUpdate.status).toBe(400);
      expect(dupUpdate.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should enforce uniqueness on type+subtype+contract+colaborator when contractId provided', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();

      // Create colaborator and contract
      const colaboratorId = await createColaborator();

      const today = new Date();
      const startDateStr = new Date(today.getTime()).toISOString().slice(0, 10);
      const endDateStr = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const contractBase = {
        rutSociedad: '12.345.678-5',
        nombreColaborador: 'Juan Perez',
        administradorContratoMandante: 'Admin M',
        administradorContratoEmpresa: 'Admin E',
        rutAdministradorContrato: '23.456.789-6',
        contractNumber: `CN-${Date.now()}`,
        nombreMandante: 'Mandante SA',
        startDate: startDateStr,
        endDate: endDateStr,
        contractType: 'consultoria',
        jornadaTrabajo: 'completa',
      };

      const contractRes = await supertest(app)
        .post('/api/contracts')
        .set('x-enable-rbac', 'false')
        .send(contractBase);
      expect(contractRes.status).toBe(201);
      const contractId = contractRes.body.data.id as string;

      // First create succeeds
      const first = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, colaboratorIds: [colaboratorId], contractId, name: 'Doc C1', issuedDate: '2025-01-01' });
      expect(first.status).toBe(201);

      // Duplicate triple should fail
      const dup = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, colaboratorIds: [colaboratorId], contractId, name: 'Doc C2', issuedDate: '2025-01-02' });
      expect(dup.status).toBe(400);
      expect(dup.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should assign documents from type/subtype to all colaborators in a group and skip duplicates', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();

      // Create 3 colaborators
      const c1 = await createColaborator();
      const c2 = await createColaborator();
      const c3 = await createColaborator();

      // Create contract
      const now = new Date();
      const startDate = now.toISOString().slice(0, 10);
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const contractDto = {
        rutSociedad: '76.543.210-1',
        nombreColaborador: 'Empresa X',
        administradorContratoMandante: 'Admin M',
        administradorContratoEmpresa: 'Admin E',
        rutAdministradorContrato: '19.876.543-2',
        contractNumber: `CN-GRP-${Date.now()}`,
        nombreMandante: 'Mandante X',
        startDate,
        endDate,
        contractType: 'consultoria',
        jornadaTrabajo: 'completa',
      };
      const contractRes = await supertest(app)
        .post('/api/contracts')
        .set('x-enable-rbac', 'false')
        .send(contractDto);
      expect(contractRes.status).toBe(201);
      const contractId = contractRes.body.data.id as string;

      // First bulk assignment
      const bulk1 = await supertest(app)
        .post('/api/documents/assign-to-group')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, contractId, colaboratorIds: [c1, c2, c3], name: 'Doc Bulk' });
      expect(bulk1.status).toBe(201);
      expect(bulk1.body.success).toBe(true);
      expect(bulk1.body.data.createdCount).toBe(3);
      expect(bulk1.body.data.skippedCount).toBe(0);
      const createdDocs = bulk1.body.data.created as Array<any>;
      expect(createdDocs.length).toBe(3);
      for (const d of createdDocs) {
        expect(d.issuedDate).toBeNull();
        expect(d.expirationDate).toBeNull();
      }

      // Second bulk assignment should skip all
      const bulk2 = await supertest(app)
        .post('/api/documents/assign-to-group')
        .set('x-enable-rbac', 'false')
        .send({ documentTypeId: typeId, documentSubtypeId: subtypeId, contractId, colaboratorIds: [c1, c2, c3], name: 'Doc Bulk 2' });
      expect(bulk2.status).toBe(201);
      expect(bulk2.body.success).toBe(true);
      expect(bulk2.body.data.createdCount).toBe(0);
      expect(bulk2.body.data.skippedCount).toBe(3);
    });
  });
});
