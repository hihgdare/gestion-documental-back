import { BaseEntity } from '@shared/domain/base-entity';
import { UUID } from '@shared/utils/common';
import { Email } from '../value-objects/email';
import { UserStatus } from '../value-objects/user-status';
import { ValidationError } from '@shared/domain/errors';

export interface UserProps {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  status?: UserStatus;
  roleId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends BaseEntity {
  private constructor(
    id: string,
    private _email: Email,
    private _firstName: string,
    private _lastName: string,
    private _password: string,
    private _status: UserStatus,
    private _roleId: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: UserProps): User {
    const id = props.id || UUID.generate().toString();
    const email = Email.create(props.email);
    const status = props.status || UserStatus.ACTIVE;
    
    this.validateRequired(props);
    
    return new User(
      id,
      email,
      props.firstName.trim(),
      props.lastName.trim(),
      props.password,
      status,
      props.roleId,
      props.createdAt || new Date(),
      props.updatedAt || new Date()
    );
  }

  public static fromPersistence(props: UserProps): User {
    const email = Email.create(props.email);
    const status = props.status || UserStatus.ACTIVE;
    
    return new User(
      props.id!,
      email,
      props.firstName,
      props.lastName,
      props.password,
      status,
      props.roleId,
      props.createdAt!,
      props.updatedAt!
    );
  }

  private static validateRequired(props: UserProps): void {
    if (!props.firstName?.trim()) {
      throw new ValidationError('First name is required', 'firstName');
    }
    if (!props.lastName?.trim()) {
      throw new ValidationError('Last name is required', 'lastName');
    }
    if (!props.password) {
      throw new ValidationError('Password is required', 'password');
    }
    if (!props.roleId) {
      throw new ValidationError('Role ID is required', 'roleId');
    }
  }

  // Getters
  public get email(): Email {
    return this._email;
  }

  public get firstName(): string {
    return this._firstName;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  public get password(): string {
    return this._password;
  }

  public get status(): UserStatus {
    return this._status;
  }

  public get roleId(): string {
    return this._roleId;
  }

  // Business methods
  public updateEmail(newEmail: string): void {
    this._email = Email.create(newEmail);
  }

  public updateName(firstName: string, lastName: string): void {
    if (!firstName?.trim()) {
      throw new ValidationError('First name is required', 'firstName');
    }
    if (!lastName?.trim()) {
      throw new ValidationError('Last name is required', 'lastName');
    }
    
    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
  }

  public updatePassword(newPassword: string): void {
    if (!newPassword) {
      throw new ValidationError('Password is required', 'password');
    }
    this._password = newPassword;
  }

  public activate(): void {
    this._status = UserStatus.ACTIVE;
  }

  public deactivate(): void {
    this._status = UserStatus.INACTIVE;
  }

  public suspend(): void {
    this._status = UserStatus.SUSPENDED;
  }

  public isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  public toJSON() {
    return {
      id: this.id,
      email: this._email.toString(),
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      status: this._status,
      roleId: this._roleId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}