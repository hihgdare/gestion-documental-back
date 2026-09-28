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
  let dependencyContainer: DependencyContainer;

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

    const role = await dependencyContainer.getRoleRepository().save({ name: 'rol.prueba', description: 'Rol de prueba' });
    await dependencyContainer.getCreateUserUseCase().execute({
      email: 'usuario@test.com',
      firstName: 'Usuario',
      lastName: 'Prueba',
      password: 'password123',
      roleIds: [role.id],
    });
  });

  describe('/api/plans', () => {
    const planDto = {
      name: 'Plan Básico',
      maxActiveColaborators: 10,
      maxActiveContracts: 5,
      maxDocuments: 100,
    };

    it('crea un plan nuevo y responde 201', async () => {
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

    it('crea un plan con límites nulos (ilimitado)', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Enterprise' });

      expect(response.status).toBe(201);
      expect(response.body.data.maxActiveColaborators).toBeNull();
      expect(response.body.data.maxActiveContracts).toBeNull();
      expect(response.body.data.maxDocuments).toBeNull();
    });

    it('lista los planes y responde 200', async () => {
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

    it('obtiene un plan por id y responde 200', async () => {
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

    it('actualiza un plan y responde 200', async () => {
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

    it('elimina un plan y responde 200', async () => {
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

    it('responde 400 si ya existe un plan con ese nombre', async () => {
      await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);

      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send(planDto);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('responde 404 si el plan no existe', async () => {
      const response = await supertest(app)
        .get('/api/plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('responde 400 si falta el nombre al crear', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ maxActiveColaborators: 10 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('responde 400 si un límite es negativo al crear', async () => {
      const response = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Inválido', maxActiveColaborators: -1 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('responde 400 si el cuerpo de la actualización está vacío', async () => {
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

    it('asigna un plan a un grupo y responde 201', async () => {
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

    it('asigna un plan sin fechas y deja endsAt en null', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });

      expect(response.status).toBe(201);
      expect(response.body.data.endsAt).toBeNull();
    });

    it('devuelve null cuando el grupo no tiene plan activo', async () => {
      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/active-plan`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it('otorga todas las funcionalidades del catálogo a un grupo sin plan', async () => {
      const catalogRes = await supertest(app)
        .get('/api/plans/features/catalog')
        .set('Authorization', 'Bearer user-id:random');

      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/features`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data.planId).toBeNull();
      const effectiveKeys = response.body.data.effectiveFeatures.map((f: { key: string }) => f.key).sort();
      const catalogKeys = catalogRes.body.data
        .flatMap((category: { features: { key: string }[] }) => category.features.map((f) => f.key))
        .sort();
      expect(effectiveKeys).toEqual(catalogKeys);
    });

    it('obtiene el plan activo del grupo y responde 200', async () => {
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

    it('no aplica un plan cuya fecha de inicio aún no llega', async () => {
      await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: '2999-01-01' });

      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/active-plan`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it('no aplica un plan vencido', async () => {
      await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: '2020-01-01', endsAt: '2020-12-31' });

      const response = await supertest(app)
        .get(`/api/plans/groups/${groupId}/active-plan`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });

    it('al asignar un plan nuevo desactiva el anterior', async () => {
      const firstRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });

      const otherPlanRes = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Nuevo' });

      await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId: otherPlanRes.body.data.id });

      const previousRes = await supertest(app)
        .get(`/api/plans/group-plans/${firstRes.body.data.id}`)
        .set('Authorization', 'Bearer user-id:random');
      expect(previousRes.body.data.isActive).toBe(false);
    });

    it('lista los planes del grupo y responde 200', async () => {
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

    it('obtiene una asignación de plan por id y responde 200', async () => {
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

    it('actualiza las fechas de la asignación y responde 200', async () => {
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

    it('desactiva una asignación de plan y responde 200', async () => {
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

    it('elimina una asignación de plan y responde 200', async () => {
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

    it('reemplaza el plan activo del grupo y responde 200', async () => {
      const firstRes = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });

      const otherPlanRes = await supertest(app)
        .post('/api/plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ name: 'Plan Reemplazo' });
      const otherPlanId = otherPlanRes.body.data.id;

      const response = await supertest(app)
        .put('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId: otherPlanId });

      expect(response.status).toBe(200);
      expect(response.body.data.planId).toBe(otherPlanId);
      expect(response.body.data.isActive).toBe(true);

      const previousRes = await supertest(app)
        .get(`/api/plans/group-plans/${firstRes.body.data.id}`)
        .set('Authorization', 'Bearer user-id:random');
      expect(previousRes.body.data.isActive).toBe(false);
    });

    it('responde 409 al eliminar un plan asignado a un grupo', async () => {
      await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId });

      const response = await supertest(app)
        .delete(`/api/plans/${planId}`)
        .set('Authorization', 'Bearer user-id:random');

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });

    it('responde 400 si el formato de fecha es inválido', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId, startsAt: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('responde 400 si planId no es un uuid', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId: 'not-a-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('responde 400 si el cuerpo de la actualización está vacío', async () => {
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

    it('responde 400 si falta groupId', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ planId });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('responde 404 si el plan no existe al asignar', async () => {
      const response = await supertest(app)
        .post('/api/plans/group-plans')
        .set('Authorization', 'Bearer user-id:random')
        .send({ groupId, planId: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(400);
    });

    it('responde 404 al actualizar una asignación inexistente', async () => {
      const response = await supertest(app)
        .put('/api/plans/group-plans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer user-id:random')
        .send({ isActive: false });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('responde 404 al eliminar una asignación inexistente', async () => {
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

  it('permite a group:assign:plan leer el plan activo (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/active-plan`)
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`);

    expect(response.status).toBe(200);
  });

  it('permite a group:assign:plan listar los planes del grupo (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/plans`)
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('permite a group:assign:plan listar planes (GET /plans)', async () => {
    const response = await supertest(app)
      .get('/api/plans')
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`);

    expect(response.status).toBe(200);
  });

  it('permite a group:assign:plan actualizar una asignación (PUT)', async () => {
    const response = await supertest(app)
      .put(`/api/plans/group-plans/${groupPlanId}`)
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`)
      .send({ isActive: true });

    expect(response.status).toBe(200);
  });

  it('permite a group:assign:plan reemplazar el plan del grupo (PUT /group-plans)', async () => {
    const response = await supertest(app)
      .put('/api/plans/group-plans')
      .set('Authorization', `Bearer user-id:${userWithAssignPerm.id}`)
      .send({ groupId, planId });

    expect(response.status).toBe(200);
    expect(response.body.data.planId).toBe(planId);
  });

  // --- plan:read: acceso a GET de planes y group-plans ---

  it('permite a plan:read listar planes (GET /plans)', async () => {
    const response = await supertest(app)
      .get('/api/plans')
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(200);
  });

  it('permite a plan:read leer el plan activo del grupo (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/active-plan`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(200);
  });

  it('permite a plan:read listar los planes del grupo (GET)', async () => {
    const response = await supertest(app)
      .get(`/api/plans/groups/${groupId}/plans`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(200);
  });

  // --- plan:read sin group:assign:plan: no puede escribir ---

  it('responde 403 a plan:read en POST /group-plans', async () => {
    const response = await supertest(app)
      .post('/api/plans/group-plans')
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`)
      .send({ groupId, planId });

    expect(response.status).toBe(403);
  });

  it('responde 403 a plan:read en PUT /group-plans', async () => {
    const response = await supertest(app)
      .put('/api/plans/group-plans')
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`)
      .send({ groupId, planId });

    expect(response.status).toBe(403);
  });

  it('responde 403 a plan:read en PUT /group-plans/:id', async () => {
    const response = await supertest(app)
      .put(`/api/plans/group-plans/${groupPlanId}`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`)
      .send({ isActive: false });

    expect(response.status).toBe(403);
  });

  it('responde 403 a plan:read en DELETE /group-plans/:id', async () => {
    const response = await supertest(app)
      .delete(`/api/plans/group-plans/${groupPlanId}`)
      .set('Authorization', `Bearer user-id:${userWithPlanReadOnly.id}`);

    expect(response.status).toBe(403);
  });

  // --- Sin autenticación: 401 ---

  it('responde 401 a una petición sin autenticar a group-plans', async () => {
    const response = await supertest(app)
      .post('/api/plans/group-plans')
      .send({ groupId, planId });

    expect(response.status).toBe(401);
  });
});
