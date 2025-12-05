/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';

describe('DocumentController with template/colaborator', () => {
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

  async function createTypeSubtypeAndTemplate() {
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

    const templateRes = await supertest(app)
      .post('/api/document-templates')
      .set('x-enable-rbac', 'false')
      .send({ name: `Template ${Date.now()}`, documentTypeId: typeId, documentSubtypeId: subtypeId });
    const templateId = templateRes.body.data.id as string;

    return { typeId, subtypeId, templateId };
  }

  async function createColaborator() {
    const base = `${Date.now()}`;
    const res = await supertest(app)
      .post('/api/colaborators')
      .set('x-enable-rbac', 'false')
      .send({
        tipoDocumento: 'rut',
        numeroDocumento: `12345678-${base.slice(-1)}`,
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
        email: `juan${base}@example.com`,
        profesion: 'Ingeniero',
        cargo: 'Analista',
      });
    expect(res.status).toBe(201);
    return res.body.data.id as string;
  }

  describe('/api/documents', () => {
    it('should create a document with template and colaborator', async () => {
      const { templateId } = await createTypeSubtypeAndTemplate();
      const colaboratorId = await createColaborator();

      const response = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({
          templateId,
          colaboratorId,
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
      expect(response.body.data.templateId).toBe(templateId);
      expect(response.body.data.colaboratorId).toBe(colaboratorId);
    });

    it('should list documents by template and by colaborator', async () => {
      const { templateId } = await createTypeSubtypeAndTemplate();
      const colaboratorId = await createColaborator();

      await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({
          templateId,
          colaboratorId,
          name: 'Documento A',
          issuedDate: '2025-01-01',
        });

      const byTemplate = await supertest(app)
        .get(`/api/documents/by-template/${templateId}`)
        .set('x-enable-rbac', 'false');
      expect(byTemplate.status).toBe(200);
      expect(byTemplate.body.success).toBe(true);
      expect(byTemplate.body.count).toBeGreaterThanOrEqual(1);

      const byColab = await supertest(app)
        .get(`/api/documents/by-colaborator/${colaboratorId}`)
        .set('x-enable-rbac', 'false');
      expect(byColab.status).toBe(200);
      expect(byColab.body.success).toBe(true);
      expect(byColab.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should update a document fields', async () => {
      const { templateId } = await createTypeSubtypeAndTemplate();
      const colaboratorId = await createColaborator();

      const createRes = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ templateId, colaboratorId, name: 'Doc Edit', issuedDate: '2025-01-01' });
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

    it('should not allow duplicate template+colaborator on create', async () => {
      const { templateId } = await createTypeSubtypeAndTemplate();
      const colaboratorId = await createColaborator();

      const first = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ templateId, colaboratorId, name: 'Doc1', issuedDate: '2025-01-01' });
      expect(first.status).toBe(201);

      const dup = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ templateId, colaboratorId, name: 'Doc2', issuedDate: '2025-01-02' });
      expect(dup.status).toBe(400);
      expect(dup.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should not allow duplicate template+colaborator on update', async () => {
      const { templateId } = await createTypeSubtypeAndTemplate();
      const colaboratorId = await createColaborator();
      const otherTemplate = (await createTypeSubtypeAndTemplate()).templateId;

      await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ templateId, colaboratorId, name: 'DocA', issuedDate: '2025-01-01' });
      const b = await supertest(app)
        .post('/api/documents')
        .set('x-enable-rbac', 'false')
        .send({ templateId: otherTemplate, colaboratorId, name: 'DocB', issuedDate: '2025-01-01' });
      const bId = b.body.data.id as string;

      const dupUpdate = await supertest(app)
        .put(`/api/documents/${bId}`)
        .set('x-enable-rbac', 'false')
        .send({ templateId, comment: 'try duplicate' });
      expect(dupUpdate.status).toBe(400);
      expect(dupUpdate.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
