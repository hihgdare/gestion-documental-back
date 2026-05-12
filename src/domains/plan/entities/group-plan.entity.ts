import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';

export interface GroupPlanProps {
  id?: string;
  groupId: number;
  planId: string;
  startsAt?: Date;
  endsAt?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroupPlanJson {
  id?: string;
  groupId: number;
  planId: string;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GroupPlan {
  id?: string;
  groupId: number;
  planId: string;
  startsAt: Date;
  endsAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: GroupPlanProps) {
    GroupPlan.validate(props);
    EntityUtils.assign(this as GroupPlan, props, {
      id: 'uuid',
      isActive: (v: boolean | undefined) => v ?? true,
      endsAt: (v: Date | null | undefined) => v ?? null,
      startsAt: (v: Date | undefined) => v ?? new Date(),
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  private static validate(props: GroupPlanProps): void {
    if (!props.groupId) {
      throw new ValidationError('Group ID is required', 'groupId');
    }
    if (!props.planId) {
      throw new ValidationError('Plan ID is required', 'planId');
    }
  }

  toJSON(): GroupPlanJson {
    return {
      id: this.id,
      groupId: this.groupId,
      planId: this.planId,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
