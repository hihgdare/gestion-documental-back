export interface CreateDocumentDto {
  documentModelId: string;
  colaboratorIds: string[];
  name: string;
  issuedDate?: string; // ISO date string
  expirationDate?: string; // ISO date string
  description?: string;
  documentUrl?: string;
  groupId: number;
  requiredColaboratorsCount?: number;
}
