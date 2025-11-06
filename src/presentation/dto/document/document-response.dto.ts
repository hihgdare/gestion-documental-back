export interface DocumentResponseDto {
  id: string;
  documentTypeId: string;
  documentSubtypeId: string;
  name: string;
  issuedDate: string; // ISO date string
  expirationDate?: string; // ISO date string
  contractId: string;
  description?: string;
  documentUrl?: string;
  isExpired: boolean;
  daysUntilExpiration: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
