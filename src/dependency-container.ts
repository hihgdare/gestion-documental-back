// Dependency Injection Container
import { UserController } from '@presentation/controllers/user.controller';
import { ContractController } from '@presentation/controllers/contract.controller';
import { AuthController } from '@presentation/controllers/auth.controller';

// User domain
import { CreateUserUseCase } from '@domains/user/use-cases/create-user.use-case';
import { GetUserByIdUseCase, GetAllUsersUseCase } from '@domains/user/use-cases/get-user.use-case';
import { UpdateUserUseCase, DeleteUserUseCase } from '@domains/user/use-cases/update-user.use-case';

// Auth domain
import { LoginUseCase } from '@domains/auth/use-cases/login.use-case';
import { VerifyTokenUseCase } from '@domains/auth/use-cases/verify-token.use-case';

// Contract domain
import { CreateContractUseCase } from '@domains/contract/use-cases/create-contract.use-case';
import {
  GetContractByIdUseCase,
  GetAllContractsUseCase,
  GetContractsByRutSociedadUseCase,
  GetContractsByNombreColaboradorUseCase,
  GetContractsByMandanteUseCase,
  GetContractsByDivisionUseCase,
  GetContractsByAreaUseCase,
  GetContractByNumberUseCase,
  GetActiveContractsUseCase,
  GetExpiredContractsUseCase,
  GetContractsEndingBeforeUseCase,
} from '@domains/contract/use-cases/get-contract.use-case';
import {
  UpdateContractUseCase,
  ActivateContractUseCase,
  SuspendContractUseCase,
  TerminateContractUseCase,
  DeleteContractUseCase,
} from '@domains/contract/use-cases/update-contract.use-case';

// Repositories
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';
import { TypeOrmContractRepository } from '@shared/infrastructure/repositories/typeorm-contract.repository';

// Services
import { JwtService } from '@shared/infrastructure/security/jwt.service';

export class DependencyContainer {
  // Repositories
  private userRepository!: TypeOrmUserRepository;
  private contractRepository!: TypeOrmContractRepository;

  // Services
  private jwtService!: JwtService;

  // Use Cases - Auth
  private loginUseCase!: LoginUseCase;
  private verifyTokenUseCase!: VerifyTokenUseCase;

  // Use Cases - User
  private createUserUseCase!: CreateUserUseCase;
  private getUserByIdUseCase!: GetUserByIdUseCase;
  private getAllUsersUseCase!: GetAllUsersUseCase;
  private updateUserUseCase!: UpdateUserUseCase;
  private deleteUserUseCase!: DeleteUserUseCase;

  // Use Cases - Contract
  private createContractUseCase!: CreateContractUseCase;
  private getContractByIdUseCase!: GetContractByIdUseCase;
  private getAllContractsUseCase!: GetAllContractsUseCase;
  private getContractsByRutSociedadUseCase!: GetContractsByRutSociedadUseCase;
  private getContractsByNombreColaboradorUseCase!: GetContractsByNombreColaboradorUseCase;
  private getContractsByMandanteUseCase!: GetContractsByMandanteUseCase;
  private getContractsByDivisionUseCase!: GetContractsByDivisionUseCase;
  private getContractsByAreaUseCase!: GetContractsByAreaUseCase;
  private getContractByNumberUseCase!: GetContractByNumberUseCase;
  private getActiveContractsUseCase!: GetActiveContractsUseCase;
  private getExpiredContractsUseCase!: GetExpiredContractsUseCase;
  private getContractsEndingBeforeUseCase!: GetContractsEndingBeforeUseCase;
  private updateContractUseCase!: UpdateContractUseCase;
  private activateContractUseCase!: ActivateContractUseCase;
  private suspendContractUseCase!: SuspendContractUseCase;
  private terminateContractUseCase!: TerminateContractUseCase;
  private deleteContractUseCase!: DeleteContractUseCase;

  // Controllers
  private authController!: AuthController;
  private userController!: UserController;
  private contractController!: ContractController;

  public async initialize(): Promise<void> {
    // Initialize repositories
    this.userRepository = new TypeOrmUserRepository();
    this.contractRepository = new TypeOrmContractRepository();

    // Initialize services
    this.jwtService = new JwtService();

    // Initialize Auth use cases
    this.loginUseCase = new LoginUseCase(this.userRepository, this.jwtService);
    this.verifyTokenUseCase = new VerifyTokenUseCase(this.userRepository, this.jwtService);

    // Initialize User use cases
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);

    // Initialize Contract use cases
    this.createContractUseCase = new CreateContractUseCase(this.contractRepository);
    this.getContractByIdUseCase = new GetContractByIdUseCase(this.contractRepository);
    this.getAllContractsUseCase = new GetAllContractsUseCase(this.contractRepository);
    this.getContractsByRutSociedadUseCase = new GetContractsByRutSociedadUseCase(this.contractRepository);
    this.getContractsByNombreColaboradorUseCase = new GetContractsByNombreColaboradorUseCase(this.contractRepository);
    this.getContractsByMandanteUseCase = new GetContractsByMandanteUseCase(this.contractRepository);
    this.getContractsByDivisionUseCase = new GetContractsByDivisionUseCase(this.contractRepository);
    this.getContractsByAreaUseCase = new GetContractsByAreaUseCase(this.contractRepository);
    this.getContractByNumberUseCase = new GetContractByNumberUseCase(this.contractRepository);
    this.getActiveContractsUseCase = new GetActiveContractsUseCase(this.contractRepository);
    this.getExpiredContractsUseCase = new GetExpiredContractsUseCase(this.contractRepository);
    this.getContractsEndingBeforeUseCase = new GetContractsEndingBeforeUseCase(this.contractRepository);
    this.updateContractUseCase = new UpdateContractUseCase(this.contractRepository);
    this.activateContractUseCase = new ActivateContractUseCase(this.contractRepository);
    this.suspendContractUseCase = new SuspendContractUseCase(this.contractRepository);
    this.terminateContractUseCase = new TerminateContractUseCase(this.contractRepository);
    this.deleteContractUseCase = new DeleteContractUseCase(this.contractRepository);

    // Initialize Controllers
    this.authController = new AuthController(
      this.loginUseCase,
      this.verifyTokenUseCase,
    );

    this.userController = new UserController(
      this.createUserUseCase,
      this.getUserByIdUseCase,
      this.getAllUsersUseCase,
      this.updateUserUseCase,
      this.deleteUserUseCase,
    );

    this.contractController = new ContractController(
      this.createContractUseCase,
      this.getContractByIdUseCase,
      this.getAllContractsUseCase,
      this.getContractsByRutSociedadUseCase,
      this.getContractsByNombreColaboradorUseCase,
      this.getContractsByMandanteUseCase,
      this.getContractsByDivisionUseCase,
      this.getContractsByAreaUseCase,
      this.getContractByNumberUseCase,
      this.getActiveContractsUseCase,
      this.getExpiredContractsUseCase,
      this.getContractsEndingBeforeUseCase,
      this.updateContractUseCase,
      this.activateContractUseCase,
      this.suspendContractUseCase,
      this.terminateContractUseCase,
      this.deleteContractUseCase,
    );
  }

  // Getters for controllers
  public getAuthController(): AuthController {
    return this.authController;
  }

  public getUserController(): UserController {
    return this.userController;
  }

  public getContractController(): ContractController {
    return this.contractController;
  }

  // Getters for repositories (if needed for testing)
  public getUserRepository(): TypeOrmUserRepository {
    return this.userRepository;
  }

  public getContractRepository(): TypeOrmContractRepository {
    return this.contractRepository;
  }
}
