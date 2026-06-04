import { EntityUtils } from '@shared/utils/common';
import { ValidationError } from '@shared/domain/errors';
import { parseEnum } from '@shared/utils/objects';
import {
  SignatureFlowOrderType,
  SignatureFlowStatus,
} from '../value-objects/signature-flow-enums';

export interface SignatureFlowProps {
  id?: string;
  documentId: string;
  orderType?: string;
  status?: string;
  sentAt?: Date | null;
  sentBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SignatureFlow {
  id: string;
  documentId: string;
  orderType: SignatureFlowOrderType;
  status: SignatureFlowStatus;
  sentAt: Date | null;
  sentBy: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: SignatureFlowProps) {
    SignatureFlow.validateRequired(props);

    EntityUtils.assign(this as SignatureFlow, props, {
      id: 'uuid',
      orderType: (v?: string) => parseEnum(v, SignatureFlowOrderType) ?? SignatureFlowOrderType.SEQUENTIAL,
      status: (v?: string) => parseEnum(v, SignatureFlowStatus) ?? SignatureFlowStatus.DRAFT,
      sentAt: 'datetimeNullable',
      sentBy: (v?: string | null) => v ?? null,
      createdAt: 'datetime',
      updatedAt: 'datetime',
    });
  }

  public static create(props: SignatureFlowProps): SignatureFlow {
    return new SignatureFlow(props);
  }

  private static validateRequired(props: SignatureFlowProps): void {
    if (!props.documentId || props.documentId.trim().length === 0) {
      throw new ValidationError('El ID del documento es requerido');
    }
  }
}
