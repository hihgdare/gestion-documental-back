/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';

describe('DocumentTemplateController', () => {
  let appInstance: App;
  let app: Application;

  beforeAll(async () => {
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);
  });

  describe('/api/document-templates', () => {
    const baseName = `Template Test ${Date.now()}`;

    async function createTypeAndSubtype() {
      const typeRes = await supertest(app)
        .post('/api/documents/types')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({ name: `Type ${Date.now()}` });

      const typeId = typeRes.body.data.id as string;

      const subtypeRes = await supertest(app)
        .post('/api/documents/subtypes')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({ name: `Subtype ${Date.now()}`, documentTypeId: typeId });

      const subtypeId = subtypeRes.body.data.id as string;
      return { typeId, subtypeId };
    }

    it('should create a new template and return 201', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();

      const response = await supertest(app)
        .post('/api/document-templates')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({ name: baseName, documentTypeId: typeId, documentSubtypeId: subtypeId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Template created successfully');
      expect(response.body.data.id).toBeString();
      expect(response.body.data.name).toBe(baseName);
    });

    it('should return 400 if validation fails', async () => {
      const response = await supertest(app)
        .post('/api/document-templates')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should get all templates and get by id', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();

      const createRes = await supertest(app)
        .post('/api/document-templates')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({ name: `${baseName} A`, documentTypeId: typeId, documentSubtypeId: subtypeId });

      const id = createRes.body.data.id as string;

      const allRes = await supertest(app)
        .get('/api/document-templates')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token');

      expect(allRes.status).toBe(200);
      expect(allRes.body.success).toBe(true);
      expect(allRes.body.count).toBeGreaterThanOrEqual(1);

      const getRes = await supertest(app)
        .get(`/api/document-templates/${id}`)
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token');

      expect(getRes.status).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(getRes.body.data.id).toBe(id);
    });

    it('should update and delete a template', async () => {
      const { typeId, subtypeId } = await createTypeAndSubtype();

      const createRes = await supertest(app)
        .post('/api/document-templates')
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({ name: `${baseName} B`, documentTypeId: typeId, documentSubtypeId: subtypeId });

      const id = createRes.body.data.id as string;

      const updateRes = await supertest(app)
        .put(`/api/document-templates/${id}`)
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token')
        .send({ name: `${baseName} B Updated` });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.message).toBe('Template updated successfully');
      expect(updateRes.body.data.name).toBe(`${baseName} B Updated`);

      const deleteRes = await supertest(app)
        .delete(`/api/document-templates/${id}`)
        .set('x-enable-rbac', 'true')
        .set('Authorization', 'Bearer skip-token');

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.message).toBe('Template deleted successfully');
    });
  });
});
