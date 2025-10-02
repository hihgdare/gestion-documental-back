export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  EXPIRED = 'expired'
}

export enum ContractType {
  INDEFINIDO = 'indefinido',
  PLAZO_FIJO = 'plazo_fijo',
  OBRA_FAENA = 'obra_faena',
  CONSULTORIA = 'consultoria',
  HONORARIOS = 'honorarios'
}

export enum JornadaTrabajo {
  COMPLETA = 'completa',
  PARCIAL = 'parcial',
  TURNO = 'turno',
  ESPECIAL = 'especial'
}

export const isValidContractStatus = (status: string): status is ContractStatus => {
  return Object.values(ContractStatus).includes(status as ContractStatus);
};

export const isValidContractType = (type: string): type is ContractType => {
  return Object.values(ContractType).includes(type as ContractType);
};

export const isValidJornadaTrabajo = (jornada: string): jornada is JornadaTrabajo => {
  return Object.values(JornadaTrabajo).includes(jornada as JornadaTrabajo);
};