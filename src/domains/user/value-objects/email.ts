import { ValidationError } from '@shared/domain/errors';
import { StringUtils } from '@shared/utils/common';

export class Email {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new ValidationError('Invalid email format', 'email');
    }
  }

  public static create(value: string): Email {
    return new Email(value);
  }

  public toString(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  private isValid(value: string): boolean {
    if (StringUtils.isEmpty(value)) {
      return false;
    }
    return StringUtils.isEmail(value);
  }
}