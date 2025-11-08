import { Request, Response } from 'express';
import { CreateRoleUseCase } from '@domains/role/use-cases/create-role.use-case';
import { GetRoleByIdUseCase, GetRolesUseCase } from '@domains/role/use-cases/get-role.use-case';
import { UpdateRoleUseCase, DeleteRoleUseCase } from '@domains/role/use-cases/update-role.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class RoleController {
  constructor(
    public readonly createRoleUseCase: CreateRoleUseCase,
    public readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    public readonly getRolesUseCase: GetRolesUseCase,
    public readonly updateRoleUseCase: UpdateRoleUseCase,
    public readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  public createRole = asyncHandler(async (req: Request, res: Response) => {
    const role = await this.createRoleUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: role,
      message: 'Role created successfully',
    });
  });

  public getRoleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await this.getRoleByIdUseCase.execute(Number(id));
    res.status(200).json({
      success: true,
      data: role,
    });
  });

  public getRoles = asyncHandler(async (req: Request, res: Response) => {
    const roles = await this.getRolesUseCase.execute();
    res.status(200).json({
      success: true,
      data: roles,
      count: roles.length,
    });
  });

  public updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await this.updateRoleUseCase.execute(Number(id), req.body);
    res.status(200).json({
      success: true,
      data: role,
      message: 'Role updated successfully',
    });
  });

  public deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteRoleUseCase.execute(Number(id));
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  });
}
