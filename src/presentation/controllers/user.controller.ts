import { Request, Response } from 'express';
import { AssignRoleToUserUseCase } from '@domains/user/use-cases/assign-role-to-user.use-case';
import { CreateUserUseCase } from '@domains/user/use-cases/create-user.use-case';
import { GetUserByIdUseCase, GetAllUsersUseCase } from '@domains/user/use-cases/get-user.use-case';
import { UpdateUserUseCase, DeleteUserUseCase } from '@domains/user/use-cases/update-user.use-case';
import { asyncHandler } from '@shared/middleware/validation';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    public readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
  ) {}

  public createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.createUserUseCase.execute(req.body);
    res.status(201).json({
      success: true,
      data: user.toJSON(),
      message: 'User created successfully',
    });
  });

  public getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.getUserByIdUseCase.execute(id);
    res.status(200).json({
      success: true,
      data: user.toJSON(),
    });
  });

  public getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.getAllUsersUseCase.execute();
    res.status(200).json({
      success: true,
      data: users.map(user => user.toJSON()),
      count: users.length,
    });
  });

  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.updateUserUseCase.execute(id, req.body);
    res.status(200).json({
      success: true,
      data: user.toJSON(),
      message: 'User updated successfully',
    });
  });

  public deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.deleteUserUseCase.execute(id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  });

  public assignRoleToUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { roleIds } = req.body;
    const user = await this.assignRoleToUserUseCase.execute({ userId: id, roleIds });
    res.status(200).json({
      success: true,
      data: user,
      message: 'Role assigned to user successfully',
    });
  });
}
