export interface DocumentResponseDto {
  id: string;
  templateId: string;
  colaboratorId: string;
  templateName?: string;
  documentTypeName?: string;
  documentSubtypeName?: string;
  name: string;
  issuedDate: string; // ISO date string
  expirationDate?: string; // ISO date string
  contractId?: string;
  contractNumber?: string;
  contractProjectName?: string;
  description?: string;
  documentUrl?: string;
  status: string;
  comment?: string | null;
  isExpired: boolean;
  daysUntilExpiration: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
