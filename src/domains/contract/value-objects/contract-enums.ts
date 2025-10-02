export enum ContractStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  EXPIRED = 'expired'
}

export enum ContractType {
  PERMANENT = 'permanent',
  TEMPORARY = 'temporary',
  CONSULTANT = 'consultant',
  INTERN = 'intern'
}

export const isValidContractStatus = (status: string): status is ContractStatus => {
  return Object.values(ContractStatus).includes(status as ContractStatus);
};

export const isValidContractType = (type: string): type is ContractType => {
  return Object.values(ContractType).includes(type as ContractType);
};