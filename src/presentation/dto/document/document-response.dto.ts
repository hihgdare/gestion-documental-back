export interface DocumentResponseDto {
  id: string;
  documentModelId: string;
  colaboratorIds: string[];
  documentTypeId?: string;
  documentSubtypeId?: string;
  documentTypeName?: string;
  documentSubtypeName?: string;
  name: string;
  issuedDate?: string | null; // ISO date string
  expirationDate?: string | null; // ISO date string
  contractId?: string;
  contractNumber?: string;
  contractProjectName?: string;
  description?: string;
  documentUrl?: string;
  status: string;
  requiredForContract: boolean;
  requiredForColaborator: boolean;
  requiredExpirationDate: boolean;
  comment?: string | null;
  isExpired: boolean;
  daysUntilExpiration: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
