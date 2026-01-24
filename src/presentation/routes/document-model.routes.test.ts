/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { DependencyContainer } from '@/dependency-container';

describe('DocumentModelController', () => {
  let appInstance: App;
  let app: Application;
  let dependencyContainer: DependencyContainer;
  let familyId: string;
  let documentTypeId: string;
  let documentSubtypeId: string;
  let userId: string;
  let groupId: number;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'true';
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
    const groupRepository = dependencyContainer.getGroupRepository();
    const permissionRepository = dependencyContainer.getPermissionRepository();

    // Create Group
    const group = await groupRepository.save({ name: 'Test Group' });
    groupId = group.id!;

    // Create Permissions
    const permissionData = [
      { name: 'document-model:create', description: 'Create document models' },
      { name: 'document-model:read', description: 'Read document models' },
      { name: 'document-model:update', description: 'Update document models' },
      { name: 'document-model:delete', description: 'Delete document models' },
      { name: 'family:create', description: 'Create families' },
      { name: 'family:read', description: 'Read families' },
      { name: 'document-type:create', description: 'Create document types' },
      { name: 'document-type:read', description: 'Read document types' },
      { name: 'document-subtype:create', description: 'Create document subtypes' },
      { name: 'document-subtype:read', description: 'Read document subtypes' },
    ];

    const permissions = [];
    for (const p of permissionData) {
      permissions.push(await permissionRepository.save(p));
    }

    // Create Role with Permissions
    const defaultRole = await roleRepository.save({
      name: 'default.role',
      description: 'Default role for tests',
      permissions: permissions,
    });

    const createdUser = await createUserUseCase.execute({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      roleIds: [defaultRole.id!],
      groupId: groupId,
    });

    userId = createdUser.id;

    // Create family
    const familyResponse = await supertest(app)
      .post('/api/families')
      .set('Authorization', `Bearer user-id:${userId}`)
      .set('Cookie', [`groupId=${groupId}`])
      .send({ name: 'Test Family' });

    familyId = familyResponse.body.data.id;

    // Create document type
    const typeResponse = await supertest(app)
      .post('/api/documents/types')
      .set('Authorization', `Bearer user-id:${userId}`)
      .set('Cookie', [`groupId=${groupId}`])
      .send({ name: 'Test Type' });

    documentTypeId = typeResponse.body.data.id;

    // Create document subtype
    const subtypeResponse = await supertest(app)
      .post('/api/documents/subtypes')
      .set('Authorization', `Bearer user-id:${userId}`)
      .set('Cookie', [`groupId=${groupId}`])
      .send({ name: 'Test Subtype', documentTypeId });

    documentSubtypeId = subtypeResponse.body.data.id;
  });

  describe('POST /api/document-models', () => {
    it('should create a new document model', async () => {
      const response = await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({
          familyId,
          documentTypeId,
          documentSubtypeId,
          requiredForContract: true,
          requiredForColaborator: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.familyId).toBe(familyId);
      expect(response.body.data.documentTypeId).toBe(documentTypeId);
      expect(response.body.data.documentSubtypeId).toBe(documentSubtypeId);
      expect(response.body.data.requiredForContract).toBe(true);
      expect(response.body.data.requiredForColaborator).toBe(false);
    });

    it('should return 404 if family not found', async () => {
      const response = await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({
          familyId: '00000000-0000-0000-0000-000000000000',
          documentTypeId,
          documentSubtypeId,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/document-models', () => {
    it('should return all document models', async () => {
      await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({ familyId, documentTypeId, documentSubtypeId });

      const response = await supertest(app)
        .get('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/document-models/:id', () => {
    it('should return a document model by id', async () => {
      const createResponse = await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({ familyId, documentTypeId, documentSubtypeId });

      const modelId = createResponse.body.data.id;

      const response = await supertest(app)
        .get(`/api/document-models/${modelId}`)
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(modelId);
    });
  });

  describe('GET /api/document-models/family/:familyId', () => {
    it('should return document models by family id', async () => {
      await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({ familyId, documentTypeId, documentSubtypeId });

      const response = await supertest(app)
        .get(`/api/document-models/family/${familyId}`)
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].familyId).toBe(familyId);
    });
  });

  describe('PUT /api/document-models/:id', () => {
    it('should update a document model', async () => {
      const createResponse = await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({
          familyId,
          documentTypeId,
          documentSubtypeId,
          requiredForContract: false,
          requiredForColaborator: false,
        });

      const modelId = createResponse.body.data.id;

      const response = await supertest(app)
        .put(`/api/document-models/${modelId}`)
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({
          requiredForContract: true,
          requiredForColaborator: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.requiredForContract).toBe(true);
      expect(response.body.data.requiredForColaborator).toBe(true);
    });
  });

  describe('DELETE /api/document-models/:id', () => {
    it('should soft delete a document model', async () => {
      const createResponse = await supertest(app)
        .post('/api/document-models')
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`])
        .send({ familyId, documentTypeId, documentSubtypeId });

      const modelId = createResponse.body.data.id;

      const deleteResponse = await supertest(app)
        .delete(`/api/document-models/${modelId}`)
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`]);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      const getResponse = await supertest(app)
        .get(`/api/document-models/${modelId}`)
        .set('Authorization', `Bearer user-id:${userId}`)
        .set('Cookie', [`groupId=${groupId}`]);

      expect(getResponse.status).toBe(404);
    });
  });
});
