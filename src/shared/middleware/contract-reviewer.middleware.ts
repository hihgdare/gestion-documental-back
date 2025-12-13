import { Request, Response, NextFunction } from 'express';
import { User } from '@domains/user/entities/user.entity';
import { CheckUserCanReviewContractUseCase } from '@domains/contract/use-cases/check-user-can-review-contract.use-case';
import { DocumentRepository } from '@domains/document/repositories/document.repository';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    contractId?: string;
  }
}

export function createContractReviewerMiddleware(
  checkUserCanReviewContractUseCase: CheckUserCanReviewContractUseCase,
  documentRepository?: DocumentRepository,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // Obtener contractId según el tipo de endpoint
      let contractId: string | undefined;

      // Si viene de params directamente (rutas de contrato)
      contractId = req.params.contractId || req.body.contractId;

      // Si no hay contractId y tenemos documentRepository y params.id, obtenerlo del documento
      if (!contractId && documentRepository && req.params.id) {
        const document = await documentRepository.findById(req.params.id);
        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }

        if (!document.contractId) {
          return res.status(400).json({ message: 'Document does not belong to any contract' });
        }

        contractId = document.contractId;
      }

      if (!contractId) {
        return res.status(400).json({ message: 'Contract ID is required' });
      }

      // Verificar si el usuario tiene permiso para revisar documentos
      if (!user.can('document:review')) {
        return res.status(403).json({
          message: 'User does not have document review permission',
          code: 'MISSING_PERMISSION',
        });
      }

      // Verificar si el usuario es un revisor activo del contrato
      const reviewCheck = await checkUserCanReviewContractUseCase.execute(contractId, user.id);

      if (!reviewCheck.canReview) {
        // Caso 1: El contrato no tiene revisores asignados
        if (!reviewCheck.hasReviewers) {
          return res.status(400).json({
            message: 'Contract has no reviewers assigned. Please assign reviewers before reviewing documents.',
            code: 'NO_REVIEWERS_ASSIGNED',
            contractId,
          });
        }

        // Caso 2: El contrato tiene revisores, pero el usuario no es uno de ellos
        return res.status(403).json({
          message: 'User is not an active reviewer for this contract',
          code: 'NOT_CONTRACT_REVIEWER',
          contractId,
        });
      }

      // Guardar el contractId en el request para uso posterior
      req.contractId = contractId;
      next();
    } catch (error) {
      return res.status(500).json({
        message: 'Error checking reviewer status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
