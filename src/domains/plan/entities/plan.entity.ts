import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';
import { FeatureJson } from '@domains/feature/entities/feature.entity';
import { isValidPlanBadge, PlanBadge } from '../value-objects/plan-badge';

export interface PlanProps {
  id?: string;
  name: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  maxStorageGb?: number | null;
  maxActiveUsers?: number | null;
  isVisible?: boolean;
  badge?: PlanBadge | null;
  features?: FeatureJson[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlanJson {
  id?: string;
  name: string;
  maxActiveColaborators: number | null;
  maxActiveContracts: number | null;
  maxDocuments: number | null;
  maxStorageGb: number | null;
  maxActiveUsers: number | null;
  isVisible: boolean;
  badge: PlanBadge | null;
  features: FeatureJson[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Plan {
  id?: string;
  name: string;
  maxActiveColaborators: number | null;
  maxActiveContracts: number | null;
  maxDocuments: number | null;
  maxStorageGb: number | null;
  maxActiveUsers: number | null;
  isVisible: boolean;
  badge: PlanBadge | null;
  features: FeatureJson[];
  createdAt: Date;
  updatedAt: Date;

  constructor(props: PlanProps) {
    Plan.validate(props);
    EntityUtils.assign(this as Plan, props, {
      id: 'uuid',
      maxActiveColaborators: (v: number | null | undefined) => v ?? null,
      maxActiveContracts: (v: number | null | undefined) => v ?? null,
      maxDocuments: (v: number | null | undefined) => v ?? null,
      maxStorageGb: (v: number | null | undefined) => v ?? null,
      maxActiveUsers: (v: number | null | undefined) => v ?? null,
      isVisible: (v: boolean | undefined) => v ?? true,
      badge: (v: PlanBadge | null | undefined) => v ?? null,
      features: (v: FeatureJson[] | undefined) => v ?? [],
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  private static validate(props: PlanProps): void {
    if (!props.name?.trim()) {
      throw new ValidationError('El nombre del plan es obligatorio', 'name');
    }
    if (props.name.length > 100) {
      throw new ValidationError('El nombre del plan no puede superar los 100 caracteres', 'name');
    }
    if (props.maxActiveColaborators !== undefined && props.maxActiveColaborators !== null && props.maxActiveColaborators < 0) {
      throw new ValidationError('El límite de colaboradores no puede ser negativo', 'maxActiveColaborators');
    }
    if (props.maxActiveContracts !== undefined && props.maxActiveContracts !== null && props.maxActiveContracts < 0) {
      throw new ValidationError('El límite de contratos no puede ser negativo', 'maxActiveContracts');
    }
    if (props.maxDocuments !== undefined && props.maxDocuments !== null && props.maxDocuments < 0) {
      throw new ValidationError('El límite de documentos no puede ser negativo', 'maxDocuments');
    }
    if (props.maxStorageGb !== undefined && props.maxStorageGb !== null && props.maxStorageGb < 0) {
      throw new ValidationError('El límite de almacenamiento no puede ser negativo', 'maxStorageGb');
    }
    if (props.maxActiveUsers !== undefined && props.maxActiveUsers !== null && props.maxActiveUsers < 0) {
      throw new ValidationError('El límite de usuarios no puede ser negativo', 'maxActiveUsers');
    }
    if (props.badge !== undefined && props.badge !== null && !isValidPlanBadge(props.badge)) {
      throw new ValidationError('La etiqueta del plan no es válida', 'badge');
    }
  }

  toJSON(): PlanJson {
    return {
      id: this.id,
      name: this.name,
      maxActiveColaborators: this.maxActiveColaborators,
      maxActiveContracts: this.maxActiveContracts,
      maxDocuments: this.maxDocuments,
      maxStorageGb: this.maxStorageGb,
      maxActiveUsers: this.maxActiveUsers,
      isVisible: this.isVisible,
      badge: this.badge,
      features: this.features,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
