/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { UserEntity } from '@shared/infrastructure/database/entities/user.entity';
import { RoleEntity } from '@shared/infrastructure/database/entities/role.entity';
import { PermissionEntity } from '@shared/infrastructure/database/entities/permission.entity';

describe('Authorization RBAC', () => {
  let appInstance: App;
  let app: Application;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'false';
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();
  });

  beforeEach(async () => {
    await clearDatabase(AppDataSource);
  });

  it('should return 401 without user header when RBAC enabled', async () => {
    process.env.ENABLE_RBAC = 'true';
    const res = await supertest(app).get('/api/roles');
    expect(res.status).toBe(401);
    process.env.ENABLE_RBAC = 'false';
  });

  it('should allow access when user has required permission via role', async () => {
    process.env.ENABLE_RBAC = 'true';
    const ds = AppDataSource;
    const userRepo = ds.getRepository(UserEntity);
    const roleRepo = ds.getRepository(RoleEntity);
    const permRepo = ds.getRepository(PermissionEntity);

    const perm = await permRepo.save(permRepo.create({ name: 'role:read' }));
    const role = await roleRepo.save(roleRepo.create({ name: 'reader', permissions: [perm] }));
    const user = await userRepo.save(userRepo.create({
      email: 'reader@example.com',
      firstName: 'Reader',
      lastName: 'Test',
      password: 'x',
      status: 'active',
      roles: [role],
    }));

    const res = await supertest(app).get('/api/roles').set('x-user-id', user.id);
    expect(res.status).toBe(200);
    process.env.ENABLE_RBAC = 'false';
  });

  it('should deny access (403) when user lacks permission', async () => {
    process.env.ENABLE_RBAC = 'true';
    const ds = AppDataSource;
    const userRepo = ds.getRepository(UserEntity);
    const roleRepo = ds.getRepository(RoleEntity);

    const role = await roleRepo.save(roleRepo.create({ name: 'empty' }));
    const user = await userRepo.save(userRepo.create({
      email: 'nope@example.com',
      firstName: 'No',
      lastName: 'Perm',
      password: 'x',
      status: 'active',
      roles: [role],
    }));

    const res = await supertest(app).get('/api/roles').set('x-user-id', user.id);
    expect(res.status).toBe(403);
    process.env.ENABLE_RBAC = 'false';
  });

  it('should inherit permission from child roles', async () => {
    process.env.ENABLE_RBAC = 'true';
    const ds = AppDataSource;
    const userRepo = ds.getRepository(UserEntity);
    const roleRepo = ds.getRepository(RoleEntity);
    const permRepo = ds.getRepository(PermissionEntity);

    // Create permission
    const perm = await permRepo.save(permRepo.create({ name: 'role:read' }));

    // Create child role with permissions
    const child = await roleRepo.save(roleRepo.create({
      name: 'child',
      permissions: [perm],
    }));

    // Create parent role and assign child
    const parent = await roleRepo.save(roleRepo.create({
      name: 'parent',
      children: [child],
    }));

    // User has parent role, should inherit permissions from child
    const user = await userRepo.save(userRepo.create({
      email: 'parent@example.com',
      firstName: 'Parent',
      lastName: 'Role',
      password: 'x',
      status: 'active',
      roles: [parent],
    }));

    const res = await supertest(app).get('/api/roles').set('x-user-id', user.id);
    expect(res.status).toBe(200);
    process.env.ENABLE_RBAC = 'false';
  });
});
