import { Request, Response } from 'express';
import { CreateContractUseCase } from '@domains/contract/use-cases/create-contract.use-case';
import {
  GetContractByIdUseCase,
  GetAllContractsUseCase,
  GetContractsByRutSociedadUseCase,
  GetContractsByNombreColaboradorUseCase,
  GetContractsByMandanteUseCase,
  GetContractsByDivisionUseCase,
  GetContractsByAreaUseCase,
  GetContractByNumberUseCase,
  GetActiveContractsUseCase,
  GetExpiredContractsUseCase,
  GetContractsEndingBeforeUseCase,
} from '@domains/contract/use-cases/get-contract.use-case';
import {
  UpdateContractUseCase,
  ActivateContractUseCase,
  SuspendContractUseCase,
  TerminateContractUseCase,
  DeleteContractUseCase,
} from '@domains/contract/use-cases/update-contract.use-case';
import { CreateContractDto } from '@presentation/dto/contract/create-contract.dto';
import { UpdateContractDto } from '@presentation/dto/contract/update-contract.dto';
import { ContractResponseDto } from '@presentation/dto/contract/contract-response.dto';
import { asyncHandler } from '@shared/middleware/validation';

export class ContractController {
  constructor(
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly getContractByIdUseCase: GetContractByIdUseCase,
    private readonly getAllContractsUseCase: GetAllContractsUseCase,
    private readonly getContractsByRutSociedadUseCase: GetContractsByRutSociedadUseCase,
    private readonly getContractsByNombreColaboradorUseCase: GetContractsByNombreColaboradorUseCase,
    private readonly getContractsByMandanteUseCase: GetContractsByMandanteUseCase,
    private readonly getContractsByDivisionUseCase: GetContractsByDivisionUseCase,
    private readonly getContractsByAreaUseCase: GetContractsByAreaUseCase,
    private readonly getContractByNumberUseCase: GetContractByNumberUseCase,
    private readonly getActiveContractsUseCase: GetActiveContractsUseCase,
    private readonly getExpiredContractsUseCase: GetExpiredContractsUseCase,
    private readonly getContractsEndingBeforeUseCase: GetContractsEndingBeforeUseCase,
    private readonly updateContractUseCase: UpdateContractUseCase,
    private readonly activateContractUseCase: ActivateContractUseCase,
    private readonly suspendContractUseCase: SuspendContractUseCase,
    private readonly terminateContractUseCase: TerminateContractUseCase,
    private readonly deleteContractUseCase: DeleteContractUseCase
  ) {}

  private toResponseDto(contract: any): ContractResponseDto {
    const json = contract.toJSON();
    return {
      id: json.id,
      rutSociedad: json.rutSociedad,
      nombreColaborador: json.nombreColaborador,
      startDate: json.startDate,
      endDate: json.endDate ? json.endDate : undefined,
      contractType: json.contractType,
      administradorContratoMandante: json.administradorContratoMandante,
      administradorContratoEmpresa: json.administradorContratoEmpresa,
      rutAdministradorContrato: json.rutAdministradorContrato,
      contractNumber: json.contractNumber,
      nombreMandante: json.nombreMandante,
      division: json.division,
      area: json.area,
      dotacionPersonal: json.dotacionPersonal,
      dotacionVehiculos: json.dotacionVehiculos,
      descripcionServicio: json.descripcionServicio,
      nombreProyecto: json.nombreProyecto,
      jornadaTrabajo: json.jornadaTrabajo,
      status: json.status,
      duration: json.duration,
      isActive: json.isActive,
      isExpired: json.isExpired,
      createdAt: json.createdAt.toISOString(),
      updatedAt: json.updatedAt.toISOString(),
    };
  }

  public createContract = asyncHandler(async (req: Request, res: Response) => {
    const dto: CreateContractDto = req.body;
    const contractRequest = {
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    };
    
    const contract = await this.createContractUseCase.execute(contractRequest);
    res.status(201).json({
      success: true,
      data: this.toResponseDto(contract),
      message: 'Contract created successfully',
    });
  });

  public getContractById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.getContractByIdUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(contract),
    });
  });

  public getAllContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await this.getAllContractsUseCase.execute();
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByRutSociedad = asyncHandler(async (req: Request, res: Response) => {
    const { rutSociedad } = req.params;
    const contracts = await this.getContractsByRutSociedadUseCase.execute(rutSociedad);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByNombreColaborador = asyncHandler(async (req: Request, res: Response) => {
    const { nombre } = req.params;
    const contracts = await this.getContractsByNombreColaboradorUseCase.execute(nombre);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByMandante = asyncHandler(async (req: Request, res: Response) => {
    const { mandante } = req.params;
    const contracts = await this.getContractsByMandanteUseCase.execute(mandante);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByDivision = asyncHandler(async (req: Request, res: Response) => {
    const { division } = req.params;
    const contracts = await this.getContractsByDivisionUseCase.execute(division);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByArea = asyncHandler(async (req: Request, res: Response) => {
    const { area } = req.params;
    const contracts = await this.getContractsByAreaUseCase.execute(area);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractByNumber = asyncHandler(async (req: Request, res: Response) => {
    const { contractNumber } = req.params;
    const contract = await this.getContractByNumberUseCase.execute(contractNumber);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(contract),
    });
  });

  public getActiveContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await this.getActiveContractsUseCase.execute();
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getExpiredContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await this.getExpiredContractsUseCase.execute();
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsEndingBefore = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Date parameter is required',
      });
      return;
    }
    
    const contracts = await this.getContractsEndingBeforeUseCase.execute(new Date(date));
    res.status(200).json({
      success: true,
      data: contracts.map((contract: any) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public updateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdateContractDto = req.body;
    const updateRequest = {
      ...dto,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    };
    
    const contract = await this.updateContractUseCase.execute(id, updateRequest);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(contract),
      message: 'Contract updated successfully',
    });
  });

  public activateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.activateContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(contract),
      message: 'Contract activated successfully',
    });
  });

  public suspendContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.suspendContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(contract),
      message: 'Contract suspended successfully',
    });
  });

  public terminateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.terminateContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: this.toResponseDto(contract),
      message: 'Contract terminated successfully',
    });
  });

  public deleteContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      message: 'Contract deleted successfully',
    });
  });
}