import { ContractReviewerRepository } from '../repositories/contract-reviewer.repository';

export class CheckUserCanReviewContractUseCase {
  constructor(
    private readonly contractReviewerRepository: ContractReviewerRepository,
  ) {}

  async execute(contractId: string, userId: string): Promise<boolean> {
    const reviewers = await this.contractReviewerRepository.findActiveByContract(contractId);
    return reviewers.some(reviewer => reviewer.userId === userId && reviewer.isActive());
  }
}
