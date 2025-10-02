export interface UpdateContractDto {
  nombreColaborador?: string;
  descripcionServicio?: string;
  dotacionPersonal?: number;
  dotacionVehiculos?: number;
  endDate?: string; // ISO date string
}