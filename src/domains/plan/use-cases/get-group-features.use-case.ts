import { GroupPlanRepository } from '../repositories/group-plan.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { GroupFeatureOverrideRepository } from '@domains/feature/repositories/group-feature-override.repository';
import { FeatureRepository } from '@domains/feature/repositories/feature.repository';
import { FeatureJson } from '@domains/feature/entities/feature.entity';

export interface GroupFeatureView extends FeatureJson {
  source: 'plan' | 'override';
}

export interface GroupFeaturesResult {
  planId: string | null;
  planFeatureIds: string[];
  overrides: { featureId: string; granted: boolean }[];
  effectiveFeatures: GroupFeatureView[];
}

export class GetGroupFeaturesUseCase {
  constructor(
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
    private readonly groupFeatureOverrideRepository: GroupFeatureOverrideRepository,
    private readonly featureRepository: FeatureRepository,
  ) {}

  async execute(groupId: number): Promise<GroupFeaturesResult> {
    const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(groupId);
    const plan = activeGroupPlan ? await this.planRepository.findById(activeGroupPlan.planId) : null;
    const overrides = await this.groupFeatureOverrideRepository.findByGroupId(groupId);

    const planFeatures = plan?.features ?? [];
    const baseFeatures = plan
      ? planFeatures
      : (await this.featureRepository.findAll()).map((feature) => feature.toJSON());
    const revokedIds = new Set(overrides.filter((o) => !o.granted).map((o) => o.featureId));
    const grantedOverrides = overrides.filter((o) => o.granted);

    const effectiveMap = new Map<string, GroupFeatureView>();
    for (const feature of baseFeatures) {
      if (!revokedIds.has(feature.id!)) {
        effectiveMap.set(feature.id!, { ...feature, source: 'plan' });
      }
    }

    const missingGrantedIds = grantedOverrides
      .map((o) => o.featureId)
      .filter((id) => !effectiveMap.has(id));
    if (missingGrantedIds.length > 0) {
      const grantedFeatures = await this.featureRepository.findIn(missingGrantedIds);
      for (const feature of grantedFeatures) {
        effectiveMap.set(feature.id!, { ...feature.toJSON(), source: 'override' });
      }
    }

    return {
      planId: plan?.id ?? null,
      planFeatureIds: planFeatures.map((f) => f.id!),
      overrides: overrides.map((o) => ({ featureId: o.featureId, granted: o.granted })),
      effectiveFeatures: [...effectiveMap.values()],
    };
  }

  async getAvailableFeatureKeys(groupId?: number): Promise<string[]> {
    if (!groupId) {
      const features = await this.featureRepository.findAll();
      return features.map((feature) => feature.key);
    }
    const { effectiveFeatures } = await this.execute(groupId);
    return effectiveFeatures.map((feature) => feature.key);
  }
}
