import { Request, Response } from 'express';
import { CreatePermissionUseCase } from '@domains/permission/use-cases/create-permission.use-case';
import { GetPermissionByIdUseCase } from '@domains/permission/use-cases/get-permission-by-id.use-case';
import { GetPermissionsUseCase } from '@domains/permission/use-cases/get-permission.use-case';
import { UpdatePermissionUseCase } from '@domains/permission/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from '@domains/permission/use-cases/delete-permission.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class PermissionController {
  constructor(
    public readonly createPermissionUseCase: CreatePermissionUseCase,
    public readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    public readonly getPermissionsUseCase: GetPermissionsUseCase,
    public readonly updatePermissionUseCase: UpdatePermissionUseCase,
    public readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  public createPermission = asyncHandler(async (req: Request, res: Response) => {
    const permission = await this.createPermissionUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: permission,
      message: 'Permission created successfully',
    });
  });

  public getPermissionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permission = await this.getPermissionByIdUseCase.execute(Number(id));
    res.status(200).json({
      success: true,
      data: permission,
    });
  });

  public getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
    const permissions = await this.getPermissionsUseCase.execute();
    res.status(200).json({
      success: true,
      data: permissions,
      count: permissions.length,
    });
  });

  public updatePermission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permission = await this.updatePermissionUseCase.execute(Number(id), req.body);
    res.status(200).json({
      success: true,
      data: permission,
      message: 'Permission updated successfully',
    });
  });

  public deletePermission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deletePermissionUseCase.execute(Number(id));
    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully',
    });
  });
}
