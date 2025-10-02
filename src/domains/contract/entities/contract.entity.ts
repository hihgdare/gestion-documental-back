import { BaseEntity } from '@shared/domain/base-entity';
import { UUID, DateUtils } from '@shared/utils/common';
import { ContractStatus, ContractType } from '../value-objects/contract-enums';
import { Salary } from '../value-objects/salary';
import { ValidationError } from '@shared/domain/errors';

export interface ContractProps {
  id?: string;
  employeeId: string;
  title: string;
  description?: string;
  type: ContractType;
  status?: ContractStatus;
  salary: {
    amount: number;
    currency?: string;
  };
  startDate: Date;
  endDate?: Date;
  departmentId: string;
  managerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Contract extends BaseEntity {
  private constructor(
    id: string,
    private _employeeId: string,
    private _title: string,
    private _description: string,
    private _type: ContractType,
    private _status: ContractStatus,
    private _salary: Salary,
    private _startDate: Date,
    private _endDate: Date | null,
    private _departmentId: string,
    private _managerId: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: ContractProps): Contract {
    const id = props.id || UUID.generate().toString();
    const status = props.status || ContractStatus.DRAFT;
    const salary = Salary.create(props.salary.amount, props.salary.currency);
    
    this.validateRequired(props);
    this.validateDates(props.startDate, props.endDate);
    
    return new Contract(
      id,
      props.employeeId,
      props.title.trim(),
      props.description?.trim() || '',
      props.type,
      status,
      salary,
      props.startDate,
      props.endDate || null,
      props.departmentId,
      props.managerId,
      props.createdAt || new Date(),
      props.updatedAt || new Date()
    );
  }

  public static fromPersistence(props: ContractProps): Contract {
    const salary = Salary.create(props.salary.amount, props.salary.currency);
    const status = props.status || ContractStatus.DRAFT;
    
    return new Contract(
      props.id!,
      props.employeeId,
      props.title,
      props.description || '',
      props.type,
      status,
      salary,
      props.startDate,
      props.endDate || null,
      props.departmentId,
      props.managerId,
      props.createdAt!,
      props.updatedAt!
    );
  }

  private static validateRequired(props: ContractProps): void {
    if (!props.employeeId) {
      throw new ValidationError('Employee ID is required', 'employeeId');
    }
    if (!props.title?.trim()) {
      throw new ValidationError('Contract title is required', 'title');
    }
    if (!props.departmentId) {
      throw new ValidationError('Department ID is required', 'departmentId');
    }
    if (!props.managerId) {
      throw new ValidationError('Manager ID is required', 'managerId');
    }
    if (!props.startDate) {
      throw new ValidationError('Start date is required', 'startDate');
    }
  }

  private static validateDates(startDate: Date, endDate?: Date): void {
    const now = new Date();
    
    if (DateUtils.isBefore(startDate, now)) {
      // Allow past start dates for existing contracts
    }
    
    if (endDate && DateUtils.isBefore(endDate, startDate)) {
      throw new ValidationError('End date cannot be before start date', 'endDate');
    }
  }

  // Getters
  public get employeeId(): string {
    return this._employeeId;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get type(): ContractType {
    return this._type;
  }

  public get status(): ContractStatus {
    return this._status;
  }

  public get salary(): Salary {
    return this._salary;
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date | null {
    return this._endDate;
  }

  public get departmentId(): string {
    return this._departmentId;
  }

  public get managerId(): string {
    return this._managerId;
  }

  // Business methods
  public activate(): void {
    if (this._status === ContractStatus.TERMINATED) {
      throw new ValidationError('Cannot activate a terminated contract', 'status');
    }
    this._status = ContractStatus.ACTIVE;
  }

  public suspend(): void {
    if (this._status === ContractStatus.TERMINATED) {
      throw new ValidationError('Cannot suspend a terminated contract', 'status');
    }
    this._status = ContractStatus.SUSPENDED;
  }

  public terminate(): void {
    this._status = ContractStatus.TERMINATED;
  }

  public updateSalary(amount: number, currency?: string): void {
    this._salary = Salary.create(amount, currency || this._salary.currency);
  }

  public updateTitle(title: string): void {
    if (!title?.trim()) {
      throw new ValidationError('Contract title is required', 'title');
    }
    this._title = title.trim();
  }

  public updateDescription(description: string): void {
    this._description = description?.trim() || '';
  }

  public extendContract(newEndDate: Date): void {
    if (DateUtils.isBefore(newEndDate, this._startDate)) {
      throw new ValidationError('New end date cannot be before start date', 'endDate');
    }
    this._endDate = newEndDate;
  }

  public isActive(): boolean {
    return this._status === ContractStatus.ACTIVE;
  }

  public isExpired(): boolean {
    if (!this._endDate) return false;
    return DateUtils.isAfter(new Date(), this._endDate);
  }

  public getDuration(): number | null {
    if (!this._endDate) return null;
    const diffTime = this._endDate.getTime() - this._startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }

  public toJSON() {
    return {
      id: this.id,
      employeeId: this._employeeId,
      title: this._title,
      description: this._description,
      type: this._type,
      status: this._status,
      salary: {
        amount: this._salary.amount,
        currency: this._salary.currency,
      },
      startDate: this._startDate,
      endDate: this._endDate,
      departmentId: this._departmentId,
      managerId: this._managerId,
      duration: this.getDuration(),
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}