import { Request, Response } from 'express';
import { CreateContractUseCase } from '@domains/contract/use-cases/create-contract.use-case';
import {
  GetContractByIdUseCase,
  GetAllContractsUseCase,
  GetContractsByEmployeeUseCase,
  GetActiveContractsUseCase,
} from '@domains/contract/use-cases/get-contract.use-case';
import {
  UpdateContractUseCase,
  ActivateContractUseCase,
  SuspendContractUseCase,
  TerminateContractUseCase,
  DeleteContractUseCase,
} from '@domains/contract/use-cases/update-contract.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class ContractController {
  constructor(
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly getContractByIdUseCase: GetContractByIdUseCase,
    private readonly getAllContractsUseCase: GetAllContractsUseCase,
    private readonly getContractsByEmployeeUseCase: GetContractsByEmployeeUseCase,
    private readonly getActiveContractsUseCase: GetActiveContractsUseCase,
    private readonly updateContractUseCase: UpdateContractUseCase,
    private readonly activateContractUseCase: ActivateContractUseCase,
    private readonly suspendContractUseCase: SuspendContractUseCase,
    private readonly terminateContractUseCase: TerminateContractUseCase,
    private readonly deleteContractUseCase: DeleteContractUseCase
  ) {}

  public createContract = asyncHandler(async (req: Request, res: Response) => {
    const contract = await this.createContractUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: contract.toJSON(),
      message: 'Contract created successfully',
    });
  });

  public getContractById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.getContractByIdUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: contract.toJSON(),
    });
  });

  public getAllContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await this.getAllContractsUseCase.execute();
    res.status(200).json({
      success: true,
      data: contracts.map(contract => contract.toJSON()),
      count: contracts.length,
    });
  });

  public getContractsByEmployee = asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const contracts = await this.getContractsByEmployeeUseCase.execute(employeeId);
    res.status(200).json({
      success: true,
      data: contracts.map(contract => contract.toJSON()),
      count: contracts.length,
    });
  });

  public getActiveContracts = asyncHandler(async (req: Request, res: Response) => {
    const contracts = await this.getActiveContractsUseCase.execute();
    res.status(200).json({
      success: true,
      data: contracts.map(contract => contract.toJSON()),
      count: contracts.length,
    });
  });

  public updateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.updateContractUseCase.execute(id, req.body);
    res.status(200).json({
      success: true,
      data: contract.toJSON(),
      message: 'Contract updated successfully',
    });
  });

  public activateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.activateContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: contract.toJSON(),
      message: 'Contract activated successfully',
    });
  });

  public suspendContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.suspendContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: contract.toJSON(),
      message: 'Contract suspended successfully',
    });
  });

  public terminateContract = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await this.terminateContractUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: contract.toJSON(),
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