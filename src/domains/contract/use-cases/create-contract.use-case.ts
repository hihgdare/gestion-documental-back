import { ContractRepository } from '../repositories/contract.repository';
import { Contract, ContractProps } from '../entities/contract.entity';
import { ContractType, JornadaTrabajo } from '../value-objects/contract-enums';
import { ConflictError } from '@shared/domain/errors';

export interface CreateContractRequest {
  rutSociedad: string;
  nombreColaborador: string;
  startDate: Date;
  endDate?: Date;
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

export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  public async execute(request: CreateContractRequest): Promise<Contract> {
    // Check if contract number already exists
    const existingContract = await this.contractRepository.findByContractNumber(request.contractNumber);
    if (existingContract) {
      throw new ConflictError('Contract with this number already exists');
    }

    const contractProps: ContractProps = {
      ...request,
      startDate: new Date(request.startDate),
      endDate: request.endDate ? new Date(request.endDate) : undefined,
    };

    const contract = Contract.create(contractProps);
    
    return await this.contractRepository.save(contract);
  }
}