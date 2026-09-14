import { ContractRepository } from '@domains/contract/repositories/contract.repository';
import { Contract, CreateContractProps } from '@domains/contract/entities/contract.entity';
import { ConflictError, ValidationError, PlanQuotaExceededError } from '@shared/domain/errors';
import { GroupRepository } from '@domains/group/repositories/group.repository';
import { GroupPlanRepository } from '@domains/plan/repositories/group-plan.repository';
import { PlanRepository } from '@domains/plan/repositories/plan.repository';

export class CreateContractUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly groupRepository: GroupRepository,
    private readonly groupPlanRepository: GroupPlanRepository,
    private readonly planRepository: PlanRepository,
  ) {}

  public async execute(request: CreateContractProps): Promise<Contract> {
    // Validate group exists
    const group = await this.groupRepository.findById(request.groupId);
    if (!group) {
      throw new ValidationError('Group not found', 'groupId');
    }

    // Check if contract number already exists
    const contractExists = await this.contractRepository.existsByContractNumber(request.contractNumber);
    if (contractExists) {
      throw new ConflictError('Contract with this number already exists');
    }

    const contract = new Contract(request);

    // Check plan quota for active contracts
    if (contract.countsForQuota()) {
      const activeGroupPlan = await this.groupPlanRepository.findActiveByGroupId(request.groupId);
      if (activeGroupPlan) {
        const plan = await this.planRepository.findById(activeGroupPlan.planId);
        if (plan && plan.maxActiveContracts !== null) {
          const currentCount = await this.contractRepository.countActiveByGroupId(request.groupId);
          if (currentCount >= plan.maxActiveContracts) {
            throw new PlanQuotaExceededError('contratos', plan.maxActiveContracts, currentCount);
          }
        }
      }
    }

    return await this.contractRepository.save(contract);
  }
}
