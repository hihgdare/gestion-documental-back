export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export const isValidUserStatus = (status: string): status is UserStatus => {
  return Object.values(UserStatus).includes(status as UserStatus);
};