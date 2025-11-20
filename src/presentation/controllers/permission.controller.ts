import { Request, Response } from 'express';
import { SavePermissionUseCase } from '@domains/permission/use-cases/save-permission.use-case';
import { FindAllPermissionsUseCase, FindPermissionByIdUseCase } from '@domains/permission/use-cases/find-permission.use-case';
import { UpdatePermissionUseCase } from '@domains/permission/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from '@domains/permission/use-cases/delete-permission.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class PermissionController {
  constructor(
    public readonly savePermissionUseCase: SavePermissionUseCase,
    public readonly getPermissionByIdUseCase: FindPermissionByIdUseCase,
    public readonly getAllPermissionsUseCase: FindAllPermissionsUseCase,
    public readonly updatePermissionUseCase: UpdatePermissionUseCase,
    public readonly deletePermissionUseCase: DeletePermissionUseCase,
  ) {}

  public createPermission = asyncHandler(async (req: Request, res: Response) => {
    const permission = await this.savePermissionUseCase.execute(req.body);
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
    const permissions = await this.getAllPermissionsUseCase.execute();
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
