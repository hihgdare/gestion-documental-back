/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { Role } from '@domains/role/entities/role.entity';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';

describe('RoleController', () => {
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

  describe('/api/roles', () => {
    const roleDto = { name: 'test.role', description: 'A test role' };

    it('should create a new role and return 201', async () => {
      const expectedRole = new Role(roleDto);

      const response = await supertest(app)
        .post('/api/roles')
        .send(roleDto);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role created successfully');
      expect(response.body.data.id).toBeInteger();
      expect(response.body.data).toMatchObject({
        name: expectedRole.name,
        description: expectedRole.description,
      });
    });

    it('should update a role and return 200', async () => {
      // Create role for this test
      const createResponse = await supertest(app)
        .post('/api/roles')
        .send(roleDto);
      const idToUpdate = createResponse.body.data.id;

      const updateDto = { ...roleDto, description: 'Updated role' };

      const response = await supertest(app)
        .put(`/api/roles/${idToUpdate}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role updated successfully');
      expect(response.body.data).toMatchObject({
        id: idToUpdate,
        name: updateDto.name,
        description: updateDto.description,
      });
    });

    it('should create permissions for role assignment and return 200', async () => {
      const permissionIds: number[] = [];
      for (let i = 0; i < 2; i++) {
        const response = await supertest(app)
          .post('/api/permissions')
          .send({ name: `test.permission.${i}`, description: `A test permission ${i}` });

        expect(response.status).toBe(201);
        permissionIds.push(response.body.data.id);
      }
    });

    describe('/{id}/permissions', () => {
      it('should assign permissions to a role and return 200', async () => {
        // Create role for this test
        const createRoleResponse = await supertest(app)
          .post('/api/roles')
          .send(roleDto);
        const roleId = createRoleResponse.body.data.id;

        // Create permissions for this test
        const permissionIds: number[] = [];
        for (let i = 0; i < 2; i++) {
          const createPermissionResponse = await supertest(app)
            .post('/api/permissions')
            .send({ name: `test.permission.${i}`, description: `A test permission ${i}` });
          permissionIds.push(createPermissionResponse.body.data.id);
        }

        const response = await supertest(app)
          .post(`/api/roles/${roleId}/permissions`)
          .send({ permissionIds });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Permissions assigned successfully');
        expect(response.body.data.id).toBe(roleId);
        expect(response.body.data.permissions).toHaveLength(permissionIds.length);
      });
    });

    it('should return 409 if role already exists', async () => {
      // Create the role first
      await supertest(app)
        .post('/api/roles')
        .send(roleDto);

      // Then try to create it again, expecting 409
      const response = await supertest(app)
        .post('/api/roles')
        .send(roleDto);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should delete a role and return 200', async () => {
      // Create role for this test
      const createResponse = await supertest(app)
        .post('/api/roles')
        .send(roleDto);
      const idToDelete = createResponse.body.data.id;

      const response = await supertest(app)
        .delete(`/api/roles/${idToDelete}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role deleted successfully');
    });

    it('should return 400 if validation fails', async () => {
      const invalidDto = { name: '' }; // Invalid name

      const response = await supertest(app)
        .post('/api/roles')
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
