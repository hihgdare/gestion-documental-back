export const FeatureKey = {
  FIRMA_SIMPLE: 'firma-electronica:simple',
  FIRMA_TRAZABILIDAD: 'firma-electronica:trazabilidad',
  FIRMA_REPORTES: 'firma-electronica:reportes',
} as const;

export type FeatureKeyValue = typeof FeatureKey[keyof typeof FeatureKey];
