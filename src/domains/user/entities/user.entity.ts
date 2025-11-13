import { BaseEntity, BasicProps } from '@shared/domain/base-entity';
import { v4 as uuid } from 'uuid';
import { ValidationError } from '@shared/domain/errors';
import { BaseProps } from '@shared/infrastructure/entity-props';
import { Email } from '../value-objects/email';
import { isValidUserStatus, UserStatus } from '../value-objects/user-status';
import { Role } from '../../role/entities/role.entity';

export type UserProps = BaseProps<User>;

export class User extends BaseEntity<User> implements BasicProps<true> {
  id: string;
  email: Email;
  firstName: string;
  lastName: string;
  password: string;
  status?: UserStatus;
  roles?: Role[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(input: Partial<User>) {
    User.validateRequired(input);
    super({
      ...input,
      email: Email.create(input.email!),
      status: isValidUserStatus(input.status) ? input.status : UserStatus.ACTIVE,
    }, true);
    this.id = (input.id as string) ?? uuid();
    this.createdAt = input.createdAt ?? new Date();
    this.updatedAt = input.updatedAt ?? new Date();
    this.email = Email.create(input.email!);
    this.firstName = input.firstName!;
    this.lastName = input.lastName!;
    this.password = input.password!;
    this.status = isValidUserStatus(input.status) ? input.status : UserStatus.ACTIVE;
    this.roles = input.roles ?? [];
  }

  private static validateRequired(props: Partial<UserProps>): void {
    if (!Email.isValid(props.email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
    if (!props.firstName?.trim()) {
      throw new ValidationError('First name is required', 'firstName');
    }
    if (!props.lastName?.trim()) {
      throw new ValidationError('Last name is required', 'lastName');
    }
    if (!props.password?.trim()) {
      throw new ValidationError('Password is required', 'password');
    }
    if (!props.roles?.length) {
      throw new ValidationError('At least one role is required', 'roles');
    }
  }

  // Business methods
  public updateEmail(email: string): void {
    this.email = Email.create(email);
  }

  public updateName(firstName: string, lastName: string): void {
    if (!firstName?.trim()) {
      throw new ValidationError('First name is required', 'firstName');
    }
    if (!lastName?.trim()) {
      throw new ValidationError('Last name is required', 'lastName');
    }

    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
  }

  public updatePassword(password: string): void {
    if (!password?.trim()) {
      throw new ValidationError('Password is required', 'password');
    }
    this.password = password.trim();
  }

  public assignRoles(roles: Role[]): void {
    this.roles = roles;
  }

  public activate(): void {
    this.status = UserStatus.ACTIVE;
  }

  public deactivate(): void {
    this.status = UserStatus.INACTIVE;
  }

  public suspend(): void {
    this.status = UserStatus.SUSPENDED;
  }

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public toJSON() {
    return {
      id: this.id,
      email: this.email.toString(),
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.lastName}`,
      status: this.status,
      roles: this.roles?.map(role => ({ id: role.id, name: role.name })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
