/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { TypeOrmRoleRepository } from '@shared/infrastructure/repositories/typeorm-role.repository';
import { SaveRoleUseCase } from '@domains/role/use-cases/save-role.use-case';

describe('UserController', () => {
  let appInstance: App;
  let app: Application;
  let roleRepository: TypeOrmRoleRepository;
  let saveRoleUseCase: SaveRoleUseCase;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'false'; // Disable RBAC for basic user tests
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();

    roleRepository = new TypeOrmRoleRepository();
    saveRoleUseCase = new SaveRoleUseCase(roleRepository);
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);
  });

  describe('/api/users', () => {
    const userDtoBase = {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'Secret123!',
    };

    async function createRole(name: string) {
      const role = await saveRoleUseCase.execute({ name, description: name });
      return role.id as number;
    }

    it('should create a new user and return 201', async () => {
      const roleId = await createRole('user.role');
      const response = await supertest(app)
        .post('/api/users')
        .send({ ...userDtoBase, roleIds: [roleId] });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.email).toBe(userDtoBase.email);
      expect(response.body.data.roles.length).toBe(1);
    });

    it('should update a user and return 200', async () => {
      const roleId = await createRole('user.role');
      const createResponse = await supertest(app)
        .post('/api/users')
        .send({ ...userDtoBase, roleIds: [roleId] });
      const userId = createResponse.body.data.id as string;

      const response = await supertest(app)
        .put(`/api/users/${userId}`)
        .send({ firstName: 'Johnny', lastName: 'Doe' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.firstName).toBe('Johnny');
    });

    it('should assign roles to a user and return 200', async () => {
      const role1 = await createRole('role.one');
      const role2 = await createRole('role.two');
      const createUserResponse = await supertest(app)
        .post('/api/users')
        .send({ ...userDtoBase, roleIds: [role1] });
      const userId = createUserResponse.body.data.id as string;

      const response = await supertest(app)
        .post(`/api/users/${userId}/roles`)
        .send({ roleIds: [role1, role2] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role assigned to user successfully');
      expect(response.body.data.roles.length).toBe(2);
    });

    it('should get all users and return 200', async () => {
      const roleId = await createRole('user.role');
      await supertest(app).post('/api/users').send({ ...userDtoBase, roleIds: [roleId] });

      const response = await supertest(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
    });

    it('should get user by id and return 200', async () => {
      const roleId = await createRole('user.role');
      const createResponse = await supertest(app)
        .post('/api/users')
        .send({ ...userDtoBase, roleIds: [roleId] });
      const userId = createResponse.body.data.id as string;

      const response = await supertest(app).get(`/api/users/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
    });

    it('should return 409 if user email already exists', async () => {
      const roleId = await createRole('user.role');
      await supertest(app).post('/api/users').send({ ...userDtoBase, roleIds: [roleId] });

      const response = await supertest(app).post('/api/users').send({ ...userDtoBase, roleIds: [roleId] });
      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should delete a user and return 200', async () => {
      const roleId = await createRole('user.role');
      const createResponse = await supertest(app)
        .post('/api/users')
        .send({ ...userDtoBase, roleIds: [roleId] });
      const userId = createResponse.body.data.id as string;

      const response = await supertest(app).delete(`/api/users/${userId}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should return 400 if validation fails on create', async () => {
      const response = await supertest(app)
        .post('/api/users')
        .send({ email: '', firstName: '', lastName: '', password: '' });
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

