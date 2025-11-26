/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { Role } from '@domains/role/entities/role.entity';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { DependencyContainer } from '@/dependency-container';
import { getUserEffectivePermissions, clearPermissionCache } from '@shared/security/authorization';

describe('RoleController', () => {
  let appInstance: App;
  let app: Application;
  let authToken: string;
  let dependencyContainer: DependencyContainer;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'true'; // Enable RBAC for tests
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();

    dependencyContainer = new DependencyContainer();
    await dependencyContainer.initialize();

    // Database is initialized inside App.initialize()
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);

    const userRepository = dependencyContainer.getUserRepository();
    const roleRepository = dependencyContainer.getRoleRepository();
    const permissionRepository = dependencyContainer.getPermissionRepository();
    const createUserUseCase = dependencyContainer.getCreateUserUseCase();

    // Create a default role for the test user
    const permissionNames = [
      'role:create',
      'role:update',
      'role:delete',
      'role:assign:permission',
      'permission:create',
    ];

    const createdPermissions = [] as { id?: number; name: string }[];
    for (const name of permissionNames) {
      const p = await permissionRepository.save({ name, description: `Permission for ${name}` });
      createdPermissions.push(p);
    }

    expect(createdPermissions.every(p => typeof p.id === 'number')).toBe(true);
    const permissionNamesSaved = createdPermissions.map(p => p.name);
    expect(permissionNamesSaved).toEqual(permissionNames);

    const defaultRole = await roleRepository.save({ name: 'default.role', description: 'Default role for tests' });

    const loadedPermissions = await permissionRepository.findIn(createdPermissions.map(p => p.id!));
    expect(loadedPermissions.map(p => p.name)).toEqual(permissionNames);

    const assignPermissionsToRoleUseCase = dependencyContainer.getAssignPermissionsToRoleUseCase();
    await assignPermissionsToRoleUseCase.execute({ roleId: defaultRole.id, permissionIds: createdPermissions.map(p => p.id!) });

    const updatedRole = await roleRepository.findById(defaultRole.id);
    expect(updatedRole?.permissions.map(p => p.name)).toEqual(permissionNames);

    const pUpdate = await permissionRepository.findByName('role:update');
    const pDelete = await permissionRepository.findByName('role:delete');
    const pAssign = await permissionRepository.findByName('role:assign:permission');
    expect(pUpdate).not.toBeNull();
    expect(pDelete).not.toBeNull();
    expect(pAssign).not.toBeNull();

    // Create a test user
    const createdUser = await createUserUseCase.execute({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      roleIds: [defaultRole.id],
    });

    // Verify user exists
    const fetchedUser = await userRepository.findById(createdUser.id);
    expect(fetchedUser).not.toBeNull();
    expect(fetchedUser?.email.toString()).toBe('test@example.com');

    // Log in the test user to get a token
    const loginResponse = await supertest(app)
      .post('/api/auth/login')
      .send({ email: createdUser.email.toString(), password: 'password123' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data).toBeDefined();
    expect(loginResponse.body.data.token).toBeDefined();

    authToken = loginResponse.body.data.token;

    clearPermissionCache(createdUser.id);
    const perms = await getUserEffectivePermissions(createdUser.id);
    expect(perms.has('role:create')).toBe(true);
    expect(perms.has('role:update')).toBe(true);
    expect(perms.has('role:delete')).toBe(true);
    expect(perms.has('role:assign:permission')).toBe(true);
  });

  describe('/api/roles', () => {
    const roleDto = { name: 'test.role', description: 'A test role' };

    it('should create a new role and return 201', async () => {
      const expectedRole = new Role(roleDto);

      const response = await supertest(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send(roleDto);
      const idToUpdate = createResponse.body.data.id;

      const updateDto = { ...roleDto, description: 'Updated role' };

      const response = await supertest(app)
        .put(`/api/roles/${idToUpdate}`)
        .set('Authorization', `Bearer ${authToken}`)
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
          .set('Authorization', `Bearer ${authToken}`)
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
          .set('Authorization', `Bearer ${authToken}`)
          .send(roleDto);
        const roleId = createRoleResponse.body.data.id;

        // Create permissions for this test
        const permissionIds: number[] = [];
        for (let i = 0; i < 2; i++) {
          const createPermissionResponse = await supertest(app)
            .post('/api/permissions')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: `test.permission.${i}`, description: `A test permission ${i}` });
          permissionIds.push(createPermissionResponse.body.data.id);
        }

        const response = await supertest(app)
          .post(`/api/roles/${roleId}/permissions`)
          .set('Authorization', `Bearer ${authToken}`)
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
        .set('Authorization', `Bearer ${authToken}`)
        .send(roleDto);

      // Then try to create it again, expecting 409
      const response = await supertest(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roleDto);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('should delete a role and return 200', async () => {
      // Create role for this test
      const createResponse = await supertest(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(roleDto);
      const idToDelete = createResponse.body.data.id;

      const response = await supertest(app)
        .delete(`/api/roles/${idToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Role deleted successfully');
    });

    it('should return 400 if validation fails', async () => {
      const invalidDto = { name: '' }; // Invalid name

      const response = await supertest(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
