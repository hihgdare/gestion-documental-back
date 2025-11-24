import { User } from '@domains/user/entities/user.entity';

export class GetAuthenticatedUserPermissionsUseCase {
  async execute(user: User): Promise<string[]> {
    return user.getPermissionNames(true);
  }
}
