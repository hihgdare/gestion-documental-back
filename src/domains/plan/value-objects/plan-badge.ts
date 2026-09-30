export enum PlanBadge {
  RECOMMENDED = 'recommended',
  POPULAR = 'popular',
}

export const isValidPlanBadge = (badge?: string | null): badge is PlanBadge => (
  Object.values(PlanBadge).includes(badge as PlanBadge)
);
