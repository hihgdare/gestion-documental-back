/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { DependencyContainer } from '@/dependency-container';
import { User } from '@domains/user/entities/user.entity';

describe('FamilyController', () => {
  let appInstance: App;
  let app: Application;
  let dependencyContainer: DependencyContainer;
  let user: User;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'false';
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();

    dependencyContainer = new DependencyContainer();
    await dependencyContainer.initialize();
  });

  afterAll(async () => {
    await appInstance.close();
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);

    const createUserUseCase = dependencyContainer.getCreateUserUseCase();
    const roleRepository = dependencyContainer.getRoleRepository();

    const defaultRole = await roleRepository.save({ name: 'default.role', description: 'Default role for tests' });

    user = await createUserUseCase.execute({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      roleIds: [defaultRole.id],
    });
  });

  describe('POST /api/families', () => {
    it('should create a new family', async () => {
      const response = await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Test Family' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Family');
      expect(response.body.data.id).toBeDefined();
    });

    it('should return 409 if family name already exists', async () => {
      await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Test Family' });

      const response = await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Test Family' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/families', () => {
    it('should return all families', async () => {
      await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Family 1' });

      await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Family 2' });

      const response = await supertest(app)
        .get('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('GET /api/families/:id', () => {
    it('should return a family by id', async () => {
      const createResponse = await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Test Family' });

      const familyId = createResponse.body.data.id;

      const response = await supertest(app)
        .get(`/api/families/${familyId}`)
        .set('Authorization', `Bearer user-id:${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(familyId);
      expect(response.body.data.name).toBe('Test Family');
    });

    it('should return 404 if family not found', async () => {
      const response = await supertest(app)
        .get('/api/families/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer user-id:${user.id}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/families/:id', () => {
    it('should update a family', async () => {
      const createResponse = await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Original Name' });

      const familyId = createResponse.body.data.id;

      const response = await supertest(app)
        .put(`/api/families/${familyId}`)
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/families/:id', () => {
    it('should soft delete a family', async () => {
      const createResponse = await supertest(app)
        .post('/api/families')
        .set('Authorization', `Bearer user-id:${user.id}`)
        .send({ name: 'Test Family' });

      const familyId = createResponse.body.data.id;

      const deleteResponse = await supertest(app)
        .delete(`/api/families/${familyId}`)
        .set('Authorization', `Bearer user-id:${user.id}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await supertest(app)
        .get(`/api/families/${familyId}`)
        .set('Authorization', `Bearer user-id:${user.id}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
