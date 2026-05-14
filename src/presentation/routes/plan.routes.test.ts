/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';

describe('PlanController', () => {
  let appInstance: App;
  let app: Application;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'false';
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  afterAll(async () => {
    await appInstance.close();
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);
  });

  describe('/api/plans', () => {
    const planDto = {
      name: 'Plan Básico',
      maxActiveColaborators: 10,
      maxActiveContracts: 5,
      maxDocuments: 100,
    };

    it('should create a new plan and return 201', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data.id).toBe('string');
      expect(response.body.data).toMatchObject({
        name: planDto.name,
        maxActiveColaborators: planDto.maxActiveColaborators,
        maxActiveContracts: planDto.maxActiveContracts,
        maxDocuments: planDto.maxDocuments,
      });
    });

    it('should create a plan with null limits (unlimited)', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Enterprise' });

      expect(response.status).toBe(201);
      expect(response.body.data.maxActiveColaborators).toBeNull();
      expect(response.body.data.maxActiveContracts).toBeNull();
      expect(response.body.data.maxDocuments).toBeNull();
    });

    it('should list plans and return 200', async () => {
      await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);

      const response = await supertest(app)
        .get('/api/plans')
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should get a plan by id and return 200', async () => {
      const createResponse = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);
      const planId = createResponse.body.data.id;

      const response = await supertest(app)
        .get(`/api/plans/${planId}`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(planId);
      expect(response.body.data.name).toBe(planDto.name);
    });

    it('should update a plan and return 200', async () => {
      const createResponse = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);
      const planId = createResponse.body.data.id;

      const response = await supertest(app)
        .put(`/api/plans/${planId}`)
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Básico Actualizado', maxActiveColaborators: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Plan Básico Actualizado');
      expect(response.body.data.maxActiveColaborators).toBe(20);
    });

    it('should delete a plan and return 200', async () => {
      const createResponse = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);
      const planId = createResponse.body.data.id;

      const response = await supertest(app)
        .delete(`/api/plans/${planId}`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Plan deleted successfully');
    });

    it('should return 409 if plan name already exists', async () => {
      await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);

      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should return 404 if plan not found', async () => {
      const response = await supertest(app)
        .get('/api/plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 if name is missing on create', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ maxActiveColaborators: 10 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if limit is negative on create', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Inválido', maxActiveColaborators: -1 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if update body is empty', async () => {
      const createResponse = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);
      const planId = createResponse.body.data.id;

      const response = await supertest(app)
        .put(`/api/plans/${planId}`)
        .set('Authorization', 'Bearer user-id:random')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
