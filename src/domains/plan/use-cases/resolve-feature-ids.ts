import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { ValidationError } from '@shared/domain/errors';

export async function resolveFeatureIds(featureRepository: FeatureRepository, featureIds: string[]): Promise<string[]> {
  const uniqueIds = [...new Set(featureIds)];
  if (uniqueIds.length > 0) {
    const features = await featureRepository.findIn(uniqueIds);
    if (features.length !== uniqueIds.length) {
      throw new ValidationError('One or more features not found', 'featureIds');
    }
  }
  return uniqueIds;
}
