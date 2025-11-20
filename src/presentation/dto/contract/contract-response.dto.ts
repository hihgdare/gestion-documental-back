import { ContractStatus, ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';

export interface ContractResponseDto {
  id: string;
  rutSociedad: string;
  nombreColaborador: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional
  contractType: ContractType;
  administradorContratoMandante: string;
  administradorContratoEmpresa: string;
  rutAdministradorContrato: string;
  contractNumber: string;
  nombreMandante: string;
  division?: string;
  area?: string;
  dotacionPersonal: number;
  dotacionVehiculos: number;
  descripcionServicio?: string;
  nombreProyecto?: string;
  jornadaTrabajo: JornadaTrabajo;
  status: ContractStatus;
  duration?: number | null; // days
  isActive: boolean;
  isExpired: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deletedAt?: string | null; // ISO date string, optional
}
