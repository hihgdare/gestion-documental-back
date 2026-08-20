import { SignatureFlowRepository } from '@domains/signature-flow/repositories/signature-flow.repository';
import { CloseSignatureFlowUseCase } from '@domains/signature-flow/use-cases/close-signature-flow.use-case';

const TIMER_CLOSE_COMMENT = 'Cierre automático: se agotó el tiempo definido sin que se completara la firma.';
const EXPIRATION_CLOSE_COMMENT = 'Cierre automático: el documento venció.';

export class SignatureFlowAutoCloseProcessor {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private cycleRunning = false;

  constructor(
    private readonly signatureFlowRepository: SignatureFlowRepository,
    private readonly closeSignatureFlowUseCase: CloseSignatureFlowUseCase,
  ) {}

  start(): void {
    const intervalMs = parseInt(process.env.SIGNATURE_FLOW_AUTO_CLOSE_INTERVAL_MS ?? '900000', 10);
    this.intervalHandle = setInterval(() => { void this.runCycle(); }, intervalMs);
    console.log(`✅ Signature flow auto-close processor started (interval: ${intervalMs}ms)`);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('Signature flow auto-close processor stopped');
    }
  }

  async runCycle(): Promise<void> {
    if (this.cycleRunning) return;
    this.cycleRunning = true;
    try {
      const now = new Date();
      await this.closeDueByTimer(now);
      await this.closeDueByExpiredDocument(now);
    } catch (error) {
      console.error('[SignatureFlowAutoCloseProcessor] Cycle error:', error);
    } finally {
      this.cycleRunning = false;
    }
  }

  private async closeDueByTimer(now: Date): Promise<void> {
    const flows = await this.signatureFlowRepository.findDueForAutoClose(now);
    for (const flow of flows) {
      try {
        await this.closeSignatureFlowUseCase.execute({
          flowId: flow.id,
          actorUserId: null,
          comment: TIMER_CLOSE_COMMENT,
        });
      } catch (error) {
        console.warn(`[SignatureFlowAutoCloseProcessor] No se pudo cerrar automáticamente el flujo ${flow.id}:`, error);
      }
    }
  }

  private async closeDueByExpiredDocument(now: Date): Promise<void> {
    const flows = await this.signatureFlowRepository.findInSigningWithExpiredDocuments(now);
    for (const flow of flows) {
      try {
        await this.closeSignatureFlowUseCase.execute({
          flowId: flow.id,
          actorUserId: null,
          comment: EXPIRATION_CLOSE_COMMENT,
        });
      } catch (error) {
        console.warn(`[SignatureFlowAutoCloseProcessor] No se pudo cerrar el flujo ${flow.id} por vencimiento del documento:`, error);
      }
    }
  }
}
