import { describe, it, expect } from 'bun:test';
import { Plan } from './plan.entity';
import { GroupPlan } from './group-plan.entity';
import { ValidationError } from '@shared/domain/errors';

// --- Plan entity ---
describe('Plan entity', () => {
  it('se crea con valores válidos', () => {
    const plan = new Plan({ name: 'Básico', maxActiveColaborators: 10 });
    expect(plan.name).toBe('Básico');
    expect(plan.maxActiveColaborators).toBe(10);
    expect(plan.maxActiveContracts).toBeNull();
    expect(plan.maxDocuments).toBeNull();
    expect(plan.id).toBeString();
    expect(plan.createdAt).toBeInstanceOf(Date);
  });

  it('lanza ValidationError si el nombre está vacío', () => {
    expect(() => new Plan({ name: '' })).toThrow(ValidationError);
  });

  it('lanza ValidationError si el nombre supera 100 caracteres', () => {
    expect(() => new Plan({ name: 'a'.repeat(101) })).toThrow(ValidationError);
  });

  it('lanza ValidationError si maxActiveColaborators es negativo', () => {
    expect(() => new Plan({ name: 'Plan', maxActiveColaborators: -1 })).toThrow(ValidationError);
  });

  it('lanza ValidationError si maxActiveContracts es negativo', () => {
    expect(() => new Plan({ name: 'Plan', maxActiveContracts: -5 })).toThrow(ValidationError);
  });

  it('lanza ValidationError si maxDocuments es negativo', () => {
    expect(() => new Plan({ name: 'Plan', maxDocuments: -10 })).toThrow(ValidationError);
  });

  it('acepta 0 como valor válido para los límites', () => {
    const plan = new Plan({ name: 'Plan', maxActiveColaborators: 0, maxActiveContracts: 0, maxDocuments: 0 });
    expect(plan.maxActiveColaborators).toBe(0);
  });

  it('acepta null para los límites (sin restricción)', () => {
    const plan = new Plan({ name: 'Plan', maxActiveColaborators: null, maxDocuments: null });
    expect(plan.maxActiveColaborators).toBeNull();
    expect(plan.maxDocuments).toBeNull();
  });

  it('usa el id proporcionado si se pasa', () => {
    const plan = new Plan({ id: 'custom-id', name: 'Plan' });
    expect(plan.id).toBe('custom-id');
  });
});

// --- GroupPlan entity ---
describe('GroupPlan entity', () => {
  it('se crea con valores válidos', () => {
    const gp = new GroupPlan({ groupId: 1, planId: 'plan-uuid' });
    expect(gp.groupId).toBe(1);
    expect(gp.planId).toBe('plan-uuid');
    expect(gp.isActive).toBe(true);
    expect(gp.endsAt).toBeNull();
    expect(gp.startsAt).toBeInstanceOf(Date);
  });

  it('lanza ValidationError si groupId no está definido', () => {
    expect(() => new GroupPlan({ groupId: 0, planId: 'plan-id' })).toThrow(ValidationError);
  });

  it('lanza ValidationError si planId está vacío', () => {
    expect(() => new GroupPlan({ groupId: 1, planId: '' })).toThrow(ValidationError);
  });

  it('respeta el valor de isActive si se proporciona', () => {
    const gp = new GroupPlan({ groupId: 1, planId: 'pid', isActive: false });
    expect(gp.isActive).toBe(false);
  });

  it('respeta endsAt si se proporciona', () => {
    const endsAt = new Date('2026-12-31');
    const gp = new GroupPlan({ groupId: 1, planId: 'pid', endsAt });
    expect(gp.endsAt).toEqual(endsAt);
  });
});
