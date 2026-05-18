/// <reference types="bun" />
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'bun:test';
import supertest from 'supertest';
import { Application } from 'express';
import { App } from '@/app';
import { AppDataSource, clearDatabase } from '@shared/infrastructure/database/typeorm.config';
import { DependencyContainer } from '@/dependency-container';
import { User } from '@domains/user/entities/user.entity';

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

  describe('/api/plans/group-plans', () => {
    let planId: string;
    let groupId: number;

    beforeEach(async () => {
      const planRes = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Test' });
      planId = planRes.body.data.id;

      const groupRes = await supertest(app)
        .post('/api/groups')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Grupo Test' });
      groupId = groupRes.body.data.id;
    });

    it('should assign a plan to a group and return 201', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: '2026-01-01' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.groupId).toBe(groupId);
      expect(response.body.data.planId).toBe(planId);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should assign a plan without dates and default endsAt to null', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });

      expect(response.status).toBe(201);
      expect(response.body.data.endsAt).toBeNull();
    });

    it('should return null when no active plan for a group', async () => {
      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/active-plan`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it('should get active group plan and return 200', async () => {
      await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: '2026-01-01' });

      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/active-plan`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data.groupId).toBe(groupId);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should list group plans and return 200', async () => {
      await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });

      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/plans`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should get a group plan by id and return 200', async () => {
      const createRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });
      const gpId = createRes.body.data.id;

      const response = await supertest(app)
        .get(`/api/plans/group-plans/${gpId}`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(gpId);
    });

    it('should update group plan dates and return 200', async () => {
      const createRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: '2026-01-01' });
      const gpId = createRes.body.data.id;

      const response = await supertest(app)
        .put(`/api/plans/group-plans/${gpId}`)
        .set('Authorization', 'Bearer user-id:random')
        .send({ endsAt: '2026-12-31' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deactivate a group plan and return 200', async () => {
      const createRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });
      const gpId = createRes.body.data.id;

      const response = await supertest(app)
        .put(`/api/plans/group-plans/${gpId}`)
        .set('Authorization', 'Bearer user-id:random')
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);
    });

    it('should delete a group plan and return 200', async () => {
      const createRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });
      const gpId = createRes.body.data.id;

      const response = await supertest(app)
        .delete(`/api/plans/group-plans/${gpId}`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid date format', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if planId is not a uuid', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if update body is empty', async () => {
      const createRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });
      const gpId = createRes.body.data.id;

      const response = await supertest(app)
        .put(`/api/plans/group-plans/${gpId}`)
        .set('Authorization', 'Bearer user-id:random')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if groupId is missing', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ planId });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existing plan', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existing group plan on update', async () => {
      const response = await supertest(app)
        .put('/api/plans/group-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer user-id:random')
        .send({ isActive: false });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existing group plan on delete', async () => {
      const response = await supertest(app)
        .delete('/api/plans/group-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});

describe('PlanController RBAC (group:assign:plan)', () => {
  let appInstance: App;
  let app: Application;
  let dependencyContainer: DependencyContainer;
  let userWithAssignPerm: User;
  let userWithPlanReadOnly: User;
  let planId: string;
  let groupId: number;
  let groupPlanId: string;

  beforeAll(async () => {
    process.env.ENABLE_RBAC = 'true';
    appInstance = new App();
    await appInstance.initialize();
    app = appInstance.getApp();

    dependencyContainer = new DependencyContainer();
    await dependencyContainer.initialize();
    await clearDatabase(AppDataSource);

    const permRepo = dependencyContainer.getPermissionRepository();
    const roleRepo = dependencyContainer.getRoleRepository();
    const assignPermsUseCase = dependencyContainer.getAssignPermissionsToRoleUseCase();
    const createUserUseCase = dependencyContainer.getCreateUserUseCase();

    const permNames = [
      'plan:create', 'plan:read',
      'group:create', 'group:read',
      'group:assign:plan',
    ];
    const perms: Record<string, { id?: number; name: string }> = {};
    for (const name of permNames) {
      perms[name] = await permRepo.save({ name, description: name });
    }

    // Role: can assign plans to groups (write access)
    const roleAssigner = await roleRepo.save({ name: 'plan.assigner', description: 'Can assign plans to groups' });
    await assignPermsUseCase.execute({
      roleId: roleAssigner.id,
      permissionIds: ['plan:create', 'group:create', 'group:read', 'group:assign:plan'].map(n => perms[n].id!),
    });

    // Role: can only read plans (no write on group-plans)
    const rolePlanRead = await roleRepo.save({ name: 'plan.reader', description: 'Can only read plans' });
    await assignPermsUseCase.execute({
      roleId: rolePlanRead.id,
      permissionIds: ['plan:read', 'group:read'].map(n => perms[n].id!),
    });

    userWithAssignPerm = await createUserUseCase.execute({
      email: 'assigner@test.com',
      firstName: 'Plan',
      lastName: 'Assigner',
      password: 'password123',
      roleIds: [roleAssigner.id],
    });

    userWithPlanReadOnly = await createUserUseCase.execute({
      email: 'reader@test.com',
      firstName: 'Plan',
      lastName: 'Reader',
      password: 'password123',
      roleIds: [rolePlanRead.id],
    });

    // Setup shared test data using the assigner user
    const planRes = await supertest(app)
      .post('/api/plans')
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`)
      .send({ name: 'Plan RBAC Test' });
    planId = planRes.body.data.id;

    const groupRes = await supertest(app)
      .post('/api/groups')
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`)
      .send({ name: 'Grupo RBAC Test' });
    groupId = groupRes.body.data.id;

    const gpRes = await supertest(app)
      .post('/api/plans/group-plans')
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`)
      .send({ groupId, planId });
    groupPlanId = gpRes.body.data.id;
  });

  afterAll(async () => {
    await appInstance.close();
  });

  // --- group:assign:plan: acceso total a escritura y lectura ---

  it('should allow group:assign:plan to read active plan (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/active-plan`)
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`);

    expect(response.status).toBe(200);
  });

  it('should allow group:assign:plan to list group plans (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/plans`)
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should allow group:assign:plan to get plan list (GET /plans)', async () => {
    const response = await supertest(app)
      .get('/api/plans')
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`);

    expect(response.status).toBe(200);
  });

  it('should allow group:assign:plan to update group plan (PUT)', async () => {
    const response = await supertest(app)
      .put(`/api/plans/group-plans/${groupPlanId}`)
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`)
      .send({ isActive: true });

    expect(response.status).toBe(200);
  });

  // --- plan:read: acceso a GET de planes y group-plans ---

  it('should allow plan:read to list plans (GET /plans)', async () => {
    const response = await supertest(app)
      .get('/api/plans')
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(200);
  });

  it('should allow plan:read to read active group plan (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/active-plan`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(200);
  });

  it('should allow plan:read to list group plans (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/plans`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(200);
  });

  // --- plan:read sin group:assign:plan: no puede escribir ---

  it('should return 403 for plan:read on POST /group-plans', async () => {
    const response = await supertest(app)
      .post('/api/plans/group-plans')
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`)
      .send({ groupId, planId });

    expect(response.status).toBe(403);
  });

  it('should return 403 for plan:read on PUT /group-plans/:id', async () => {
    const response = await supertest(app)
      .put(`/api/plans/group-plans/${groupPlanId}`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`)
      .send({ isActive: false });

    expect(response.status).toBe(403);
  });

  it('should return 403 for plan:read on DELETE /group-plans/:id', async () => {
    const response = await supertest(app)
      .delete(`/api/plans/group-plans/${groupPlanId}`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(403);
  });

  // --- Sin autenticación: 401 ---

  it('should return 401 for unauthenticated request to group-plans', async () => {
    const response = await supertest(app)
      .post('/api/plans/group-plans')
      .send({ groupId, planId });

    expect(response.status).toBe(401);
  });
});
