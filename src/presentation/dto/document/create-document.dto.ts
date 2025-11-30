export interface CreateDocumentDto {
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: string; // ISO date string
  expirationDate?: string; // ISO date string
  description?: string;
  documentUrl?: string;
}
