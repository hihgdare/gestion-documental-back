import { Request, Response, NextFunction } from 'express';
import { isRbacEnabled } from '@shared/utils/requests';
import { FeatureNotAvailableError } from '@shared/domain/errors';
import { GetGroupFeaturesUseCase } from '@domains/plan/use-cases/get-group-features.use-case';

export const requireFeature = (
  featureKey: string,
  getGroupFeaturesUseCase: GetGroupFeaturesUseCase,
) => async (req: Request, _res: Response, next: NextFunction) => {
  if (!isRbacEnabled(req)) return next();

  const groupId = req.auth?.groupId;
  if (!groupId) return next();

  const { effectiveFeatures } = await getGroupFeaturesUseCase.execute(groupId);
  if (!effectiveFeatures.some((feature) => feature.key === featureKey)) {
    throw new FeatureNotAvailableError(featureKey);
  }

  next();
};
