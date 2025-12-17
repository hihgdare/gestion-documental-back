export interface UpdateDocumentDto {
  templateId?: string;
  colaboratorIds?: string[];
  name?: string;
  issuedDate?: string; // ISO date string
  expirationDate?: string; // ISO date string
  contractId?: string;
  description?: string;
  documentUrl?: string;
  comment?: string;
}
