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
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
  groupId: number;
}
