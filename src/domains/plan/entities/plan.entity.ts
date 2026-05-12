import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface PlanProps {
  id?: string;
  name: string;
  maxActiveColaborators?: number | null;
  maxActiveContracts?: number | null;
  maxDocuments?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlanJson {
  id?: string;
  name: string;
  maxActiveColaborators: number | null;
  maxActiveContracts: number | null;
  maxDocuments: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Plan {
  id?: string;
  name: string;
  maxActiveColaborators: number | null;
  maxActiveContracts: number | null;
  maxDocuments: number | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: PlanProps) {
    Plan.validate(props);
    EntityUtils.assign(this as Plan, props, {
      id: 'uuid',
      maxActiveColaborators: (v: number | null | undefined) => v ?? null,
      maxActiveContracts: (v: number | null | undefined) => v ?? null,
      maxDocuments: (v: number | null | undefined) => v ?? null,
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  private static validate(props: PlanProps): void {
    if (!props.name?.trim()) {
      throw new ValidationError('Plan name is required', 'name');
    }
    if (props.name.length > 100) {
      throw new ValidationError('Plan name is too long', 'name');
    }
    if (props.maxActiveColaborators !== undefined && props.maxActiveColaborators !== null && props.maxActiveColaborators < 0) {
      throw new ValidationError('maxActiveColaborators must be non-negative', 'maxActiveColaborators');
    }
    if (props.maxActiveContracts !== undefined && props.maxActiveContracts !== null && props.maxActiveContracts < 0) {
      throw new ValidationError('maxActiveContracts must be non-negative', 'maxActiveContracts');
    }
    if (props.maxDocuments !== undefined && props.maxDocuments !== null && props.maxDocuments < 0) {
      throw new ValidationError('maxDocuments must be non-negative', 'maxDocuments');
    }
  }

  toJSON(): PlanJson {
    return {
      id: this.id,
      name: this.name,
      maxActiveColaborators: this.maxActiveColaborators,
      maxActiveContracts: this.maxActiveContracts,
      maxDocuments: this.maxDocuments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
