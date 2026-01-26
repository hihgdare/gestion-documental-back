export interface CreateDocumentDto {
  documentTypeId: string;
  documentSubtypeId: string;
  colaboratorIds: string[];
  name: string;
  issuedDate?: string; // ISO date string
  expirationDate?: string; // ISO date string
  contractId?: string;
  description?: string;
  documentUrl?: string;
  groupId: number;
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
  requiredExpirationDate?: boolean;
}
