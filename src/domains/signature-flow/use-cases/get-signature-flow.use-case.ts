import { SignatureFlow } from '../entities/signature-flow.entity';
import { SignatureFlowParticipant } from '../entities/signature-flow-participant.entity';
import { type SignatureFlowRepository } from '../repositories/signature-flow.repository';
import { type SignatureFlowParticipantRepository } from '../repositories/signature-flow-participant.repository';
import { NotFoundError } from '@shared/domain/errors';

export class GetSignatureFlowByIdUseCase {
  constructor(private readonly repository: SignatureFlowRepository) {}

  async execute(id: string): Promise<SignatureFlow> {
    const flow = await this.repository.findById(id);
    if (!flow) throw new NotFoundError('Flujo de firma no encontrado');
    return flow;
  }
}

export class GetSignatureFlowsByDocumentIdUseCase {
  constructor(private readonly repository: SignatureFlowRepository) {}

  async execute(documentId: string): Promise<SignatureFlow[]> {
    return this.repository.findByDocumentId(documentId);
  }
}

export class GetSignatureFlowParticipantsByFlowIdUseCase {
  constructor(private readonly participantRepository: SignatureFlowParticipantRepository) {}

  async execute(flowId: string): Promise<SignatureFlowParticipant[]> {
    return this.participantRepository.findByFlowId(flowId);
  }
}

export class GetSignatureFlowParticipantsByUserIdUseCase {
  constructor(private readonly participantRepository: SignatureFlowParticipantRepository) {}

  async execute(userId: string): Promise<SignatureFlowParticipant[]> {
    return this.participantRepository.findByUserId(userId);
  }
}
