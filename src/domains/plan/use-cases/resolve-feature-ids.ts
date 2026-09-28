import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { ValidationError } from '@shared/domain/errors';

export async function resolveFeatureIds(featureRepository: FeatureRepository, featureIds: string[]): Promise<string[]> {
  const uniqueIds = [...new Set(featureIds)];
  if (uniqueIds.length > 0) {
    const features = await featureRepository.findIn(uniqueIds);
    if (features.length !== uniqueIds.length) {
      throw new ValidationError('Una o más funcionalidades seleccionadas no existen', 'featureIds');
    }
  }
  return uniqueIds;
}
