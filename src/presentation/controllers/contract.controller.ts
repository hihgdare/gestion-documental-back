import { Request, Response } from 'express';
import { Contract } from '@domains/contract/entities/contract.entity';
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
import { DateTimeUtils, DateUtils } from '@shared/utils/date';
import { ContractStatus, ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';
import { AddSubcontractUseCase } from '@domains/contract/use-cases/add-subcontract.use-case';
import { RemoveSubcontractUseCase } from '@domains/contract/use-cases/remove-subcontract.use-case';
import { GetSubcontractsUseCase } from '@domains/contract/use-cases/get-subcontracts.use-case';
import { AddDocumentToContractUseCase } from '@domains/contract/use-cases/add-document.use-case';
import { RemoveDocumentFromContractUseCase } from '@domains/contract/use-cases/remove-document.use-case';
import { GetContractDocumentsUseCase } from '@domains/contract/use-cases/get-contract-documents.use-case';


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
    private readonly deleteContractUseCase: DeleteContractUseCase,
    private readonly addSubcontractUseCase: AddSubcontractUseCase,
    private readonly removeSubcontractUseCase: RemoveSubcontractUseCase,
    private readonly getSubcontractsUseCase: GetSubcontractsUseCase,
    private readonly addDocumentToContractUseCase: AddDocumentToContractUseCase,
    private readonly removeDocumentFromContractUseCase: RemoveDocumentFromContractUseCase,
    private readonly getContractDocumentsUseCase: GetContractDocumentsUseCase,
  ) { }


  private toResponseDto(contract: Contract): ContractResponseDto {
    const json = contract.toJSON();
    return {
      id: json.id,
      rutSociedad: json.rutSociedad,
      nombreColaborador: json.nombreColaborador,
      startDate: DateUtils.toString(json.startDate),
      endDate: DateUtils.toString(json.endDate),
      contractType: json.contractType as ContractType,
      administradorContratoMandante: json.administradorContratoMandante,
      administradorContratoEmpresa: json.administradorContratoEmpresa,
      rutAdministradorContrato: json.rutAdministradorContrato,
      contractNumber: json.contractNumber,
      nombreMandante: json.nombreMandante,
      division: json.division,
      area: json.area,
      dotacionPersonal: json.dotacionPersonal ?? 0,
      dotacionVehiculos: json.dotacionVehiculos ?? 0,
      descripcionServicio: json.descripcionServicio,
      nombreProyecto: json.nombreProyecto,
      jornadaTrabajo: json.jornadaTrabajo as JornadaTrabajo,
      status: json.status as ContractStatus,
      duration: json.duration,
      isActive: json.isActive,
      isExpired: json.isExpired,
      createdAt: DateTimeUtils.toString(json.createdAt),
      updatedAt: DateTimeUtils.toString(json.updatedAt),
      deletedAt: DateTimeUtils.toString(json.deletedAt, true),
    };
  }

  public createContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await this.createContractUseCase.execute(req.body as CreateContractDto);
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
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByRutSociedad = asyncHandler(async (req: Request, res: Response) => {
    const { rutSociedad } = req.params;
    const contracts = await this.getContractsByRutSociedadUseCase.execute(rutSociedad);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByNombreColaborador = asyncHandler(async (req: Request, res: Response) => {
    const { nombre } = req.params;
    const contracts = await this.getContractsByNombreColaboradorUseCase.execute(nombre);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByMandante = asyncHandler(async (req: Request, res: Response) => {
    const { mandante } = req.params;
    const contracts = await this.getContractsByMandanteUseCase.execute(mandante);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByDivision = asyncHandler(async (req: Request, res: Response) => {
    const { division } = req.params;
    const contracts = await this.getContractsByDivisionUseCase.execute(division);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getContractsByArea = asyncHandler(async (req: Request, res: Response) => {
    const { area } = req.params;
    const contracts = await this.getContractsByAreaUseCase.execute(area);
    res.status(200).json({
      success: true,
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
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
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public getExpiredContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await this.getExpiredContractsUseCase.execute();
    res.status(200).json({
      success: true,
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
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
      data: contracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: contracts.length,
    });
  });

  public updateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdateContractDto = req.body;
    const updateRequest = {
      ...dto,
      id,
      endDate: DateUtils.parse(dto.endDate, true) ?? undefined,
    };

    const contract = await this.updateContractUseCase.execute(updateRequest);
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

  // Subcontract management methods
  public addSubcontract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { subcontractId } = req.body;

    if (!subcontractId) {
      res.status(400).json({
        success: false,
        message: 'Subcontract ID is required',
      });
      return;
    }

    await this.addSubcontractUseCase.execute(id, subcontractId);
    res.status(200).json({
      success: true,
      message: 'Subcontract added successfully',
    });
  });

  public removeSubcontract = asyncHandler(async (req: Request, res: Response) => {
    const { id, subcontractId } = req.params;

    await this.removeSubcontractUseCase.execute(id, subcontractId);
    res.status(200).json({
      success: true,
      message: 'Subcontract removed successfully',
    });
  });

  public getSubcontracts = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const subcontracts = await this.getSubcontractsUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: subcontracts.map((contract: Contract) => this.toResponseDto(contract)),
      count: subcontracts.length,
    });
  });

  // Document association methods
  public addDocument = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { documentId } = req.body;

    if (!documentId) {
      res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
      return;
    }

    await this.addDocumentToContractUseCase.execute(id, documentId);
    res.status(200).json({
      success: true,
      message: 'Document linked successfully',
    });
  });

  public removeDocument = asyncHandler(async (req: Request, res: Response) => {
    const { id, documentId } = req.params;

    await this.removeDocumentFromContractUseCase.execute(id, documentId);
    res.status(200).json({
      success: true,
      message: 'Document unlink successful',
    });
  });

  public getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const documents = await this.getContractDocumentsUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: documents.map((doc) => ({
        id: doc.id!,
        documentTypeId: doc.documentTypeId,
        documentSubtypeId: doc.documentSubtypeId,
        name: doc.name,
        issuedDate: doc.issuedDate,
        expirationDate: doc.expirationDate,
        description: doc.description,
        documentUrl: doc.documentUrl,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      count: documents.length,
    });
  });
}
