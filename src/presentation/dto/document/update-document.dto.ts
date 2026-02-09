export interface UpdateDocumentDto {
  documentModelId?: string;
  colaboratorIds?: string[];
  name?: string;
  issuedDate?: string; // ISO date string
  expirationDate?: string; // ISO date string
  contractId?: string;
  description?: string;
  documentUrl?: string;
  comment?: string;
  groupId?: number;
  requiredColaboratorsCount?: number;
}
