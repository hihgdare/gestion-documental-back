/// <reference types="bun" />
import { describe, it, expect, beforeAll } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { Permission } from '@domains/permission/entities/permission.entity';

describe('PermissionController', () => {
  let appInstance: App;
  let app: Application;

  beforeAll(async () => {
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  describe('/api/permissions', () => {
    let createdId: number;
    const permissionDto = { name: 'test.permission', description: 'A test permission' };

    it('should create a new permission and return 201', async () => {
      const expectedPermission = new Permission(permissionDto);

      const response = await supertest(app)
        .post('/api/permissions')
        .send(permissionDto);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission created successfully');
      expect(response.body.data.id).toBeInteger();
      expect(response.body.data).toMatchObject({
        name: expectedPermission.name,
        description: expectedPermission.description,
      });

      createdId = response.body.data.id;
    });

    it('should update a permission and return 200', async () => {
      const updateDto = { ...permissionDto, description: 'Updated permission' };

      const response = await supertest(app)
        .put(`/api/permissions/${createdId}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission updated successfully');
      expect(response.body.data).toMatchObject({
        id: createdId,
        name: updateDto.name,
        description: updateDto.description,
      });
    });

    it('should return 409 if permission already exists', async () => {
      const response = await supertest(app)
        .post('/api/permissions')
        .send(permissionDto);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should delete a permission and return 200', async () => {
      const response = await supertest(app)
        .delete(`/api/permissions/${createdId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Permission deleted successfully');
    });

    it('should return 400 if validation fails', async () => {
      const invalidDto = { name: '' };

      const response = await supertest(app)
        .post('/api/permissions')
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
