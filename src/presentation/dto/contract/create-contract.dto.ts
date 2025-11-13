import { ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';

export interface CreateContractDto {
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
  dotacionPersonal?: number;
  dotacionVehiculos?: number;
  descripcionServicio?: string;
  nombreProyecto?: string;
  jornadaTrabajo: JornadaTrabajo;
}
