/// <reference types="bun" />
import { describe, it, expect, beforeAll } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { Role } from '@domains/role/entities/role.entity';

describe('RoleController', () => {
  let appInstance: App;
  let app: Application;
  const permissionIds: number[] = [];

  beforeAll(async () => {
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  describe('/api/roles', () => {
    let createdId: number;
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

      createdId = response.body.data.id;
    });

    it('should update a role and return 200', async () => {
      const updateDto = { ...roleDto, description: 'Updated role' };

      const response = await supertest(app)
        .put(`/api/roles/${createdId}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role updated successfully');
      expect(response.body.data).toMatchObject({
        id: createdId,
        name: updateDto.name,
        description: updateDto.description,
      });
    });

    it('should create permissions for role assignment and return 200', async () => {
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
        const response = await supertest(app)
          .post(`/api/roles/${createdId}/permissions`)
          .send({ permissionIds });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Permissions assigned successfully');
        expect(response.body.data.id).toBe(createdId);
        expect(response.body.data.permissions).toHaveLength(permissionIds.length);
      });
    });

    it('should return 409 if role already exists', async () => {
      const response = await supertest(app)
        .post('/api/roles')
        .send(roleDto);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should delete a role and return 200', async () => {
      const response = await supertest(app)
        .delete(`/api/roles/${createdId}`);

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
