import { SignatureFlowParticipant } from '../entities/signature-flow-participant.entity';

export interface SignatureFlowParticipantRepository {
  findById(id: string): Promise<SignatureFlowParticipant | null>;
  findByFlowId(flowId: string): Promise<SignatureFlowParticipant[]>;
  findByFlowIdAndRole(flowId: string, role: string): Promise<SignatureFlowParticipant[]>;
  findByUserId(userId: string): Promise<SignatureFlowParticipant[]>;
  save(participant: SignatureFlowParticipant): Promise<SignatureFlowParticipant>;
  update(participant: SignatureFlowParticipant): Promise<SignatureFlowParticipant>;
  delete(id: string): Promise<void>;
  deleteByFlowId(flowId: string): Promise<void>;
}
