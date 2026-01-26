export interface UpdateDocumentDto {
  documentTypeId?: string;
  documentSubtypeId?: string;
  colaboratorIds?: string[];
  name?: string;
  issuedDate?: string; // ISO date string
  expirationDate?: string; // ISO date string
  contractId?: string;
  description?: string;
  documentUrl?: string;
  comment?: string;
  groupId?: number;
  requiredForContract?: boolean;
  requiredForColaborator?: boolean;
  requiredExpirationDate?: boolean;
}
