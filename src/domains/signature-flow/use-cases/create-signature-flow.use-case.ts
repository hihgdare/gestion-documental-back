import { SignatureFlow, SignatureFlowProps } from '../entities/signature-flow.entity';
import { SignatureFlowParticipant, SignatureFlowParticipantProps } from '../entities/signature-flow-participant.entity';
import { type SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { type SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import { ValidationError } from '@shared/domain/errors';

export interface CreateSignatureFlowInput {
  documentId: string;
  orderType?: string;
  sentBy?: string;
  participants: Array<{
    userId?: string;
    externalName?: string;
    externalEmail?: string;
    role: string;
    order?: number;
  }>;
}

export class CreateSignatureFlowUseCase {
  constructor(
    private readonly signatureFlowRepository: SignatureFlowRepository,
    private readonly participantRepository: SignatureFlowParticipantRepository,
  ) {}

  async execute(input: CreateSignatureFlowInput): Promise<SignatureFlow> {
    if (!input.participants || input.participants.length === 0) {
      throw new ValidationError('El flujo debe tener al menos un participante');
    }

    const flowProps: SignatureFlowProps = {
      documentId: input.documentId,
      orderType: input.orderType,
      sentBy: input.sentBy ?? null,
    };

    const flow = await this.signatureFlowRepository.save(SignatureFlow.create(flowProps));

    for (const p of input.participants) {
      const participantProps: SignatureFlowParticipantProps = {
        flowId: flow.id,
        userId: p.userId ?? null,
        externalName: p.externalName ?? null,
        externalEmail: p.externalEmail ?? null,
        role: p.role,
        order: p.order ?? null,
      };
      await this.participantRepository.save(SignatureFlowParticipant.create(participantProps));
    }

    return flow;
  }
}
