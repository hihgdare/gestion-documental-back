import { Request, Response } from 'express';
import { CreateCompanyUseCase } from '@domains/company/use-cases/create-company.use-case';
import { GetCompanyByIdUseCase, GetAllCompaniesUseCase } from '@domains/company/use-cases/get-company.use-case';
import { UpdateCompanyUseCase, DeleteCompanyUseCase } from '@domains/company/use-cases/update-company.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class CompanyController {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getCompanyByIdUseCase: GetCompanyByIdUseCase,
    private readonly getAllCompaniesUseCase: GetAllCompaniesUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
  ) {}

  public createCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await this.createCompanyUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: company.toJSON(),
      message: 'Empresa creada exitosamente',
    });
  });

  public getCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const company = await this.getCompanyByIdUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: company.toJSON(),
    });
  });

  public getAllCompanies = asyncHandler(async (req: Request, res: Response) => {
    const companies = await this.getAllCompaniesUseCase.execute();
    res.status(200).json({
      success: true,
      data: companies.map(company => company.toJSON()),
      count: companies.length,
    });
  });

  public updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const company = await this.updateCompanyUseCase.execute(id, req.body);
    res.status(200).json({
      success: true,
      data: company.toJSON(),
      message: 'Empresa actualizada exitosamente',
    });
  });

  public deleteCompany = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteCompanyUseCase.execute(id);
    res.status(200).json({
      success: true,
      message: 'Empresa eliminada exitosamente',
    });
  });
}
