// Dependency Injection Container
import { UserController } from '@presentation/controllers/user.controller';
import { ContractController } from '@presentation/controllers/contract.controller';
import { DocumentTypeController } from '@presentation/controllers/document-type.controller';

// User domain
import { CreateUserUseCase } from '@domains/user/use-cases/create-user.use-case';
import { GetUserByIdUseCase, GetAllUsersUseCase } from '@domains/user/use-cases/get-user.use-case';
import { UpdateUserUseCase, DeleteUserUseCase } from '@domains/user/use-cases/update-user.use-case';

// DocumentType domain
import { CreateDocumentTypeUseCase } from '@domains/document-type/use-cases/create-document-type.use-case';
import { GetDocumentTypeByIdUseCase, GetAllDocumentTypesUseCase } from '@domains/document-type/use-cases/get-document-type.use-case';
import { UpdateDocumentTypeUseCase, DeleteDocumentTypeUseCase } from '@domains/document-type/use-cases/update-document-type.use-case';

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
import { TypeOrmDocumentTypeRepository } from '@shared/infrastructure/repositories/typeorm-document-type.repository';

export class DependencyContainer {
  // Repositories
  private userRepository!: TypeOrmUserRepository;
  private contractRepository!: TypeOrmContractRepository;
  private documentTypeRepository!: TypeOrmDocumentTypeRepository;

  // Use Cases - User
  private createUserUseCase!: CreateUserUseCase;
  private getUserByIdUseCase!: GetUserByIdUseCase;
  private getAllUsersUseCase!: GetAllUsersUseCase;
  private updateUserUseCase!: UpdateUserUseCase;
  private deleteUserUseCase!: DeleteUserUseCase;

  // Use Cases - DocumentType
  private createDocumentTypeUseCase!: CreateDocumentTypeUseCase;
  private getDocumentTypeByIdUseCase!: GetDocumentTypeByIdUseCase;
  private getAllDocumentTypesUseCase!: GetAllDocumentTypesUseCase;
  private updateDocumentTypeUseCase!: UpdateDocumentTypeUseCase;
  private deleteDocumentTypeUseCase!: DeleteDocumentTypeUseCase;

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
  private userController!: UserController;
  private contractController!: ContractController;
  private documentTypeController!: DocumentTypeController;

  public async initialize(): Promise<void> {
    // Initialize repositories
    this.userRepository = new TypeOrmUserRepository();
    this.contractRepository = new TypeOrmContractRepository();
    this.documentTypeRepository = new TypeOrmDocumentTypeRepository();

    // Initialize User use cases
    this.createUserUseCase = new CreateUserUseCase(this.userRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);

    // Initialize DocumentType use cases
    this.createDocumentTypeUseCase = new CreateDocumentTypeUseCase(this.documentTypeRepository);
    this.getDocumentTypeByIdUseCase = new GetDocumentTypeByIdUseCase(this.documentTypeRepository);
    this.getAllDocumentTypesUseCase = new GetAllDocumentTypesUseCase(this.documentTypeRepository);
    this.updateDocumentTypeUseCase = new UpdateDocumentTypeUseCase(this.documentTypeRepository);
    this.deleteDocumentTypeUseCase = new DeleteDocumentTypeUseCase(this.documentTypeRepository);

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

    this.documentTypeController = new DocumentTypeController(
      this.createDocumentTypeUseCase,
      this.getDocumentTypeByIdUseCase,
      this.getAllDocumentTypesUseCase,
      this.updateDocumentTypeUseCase,
      this.deleteDocumentTypeUseCase,
    );
    
  }

  // Getters for controllers
  public getUserController(): UserController {
    return this.userController;
  }

  public getContractController(): ContractController {
    return this.contractController;
  }

  public getDocumentTypeController(): DocumentTypeController {
    return this.documentTypeController;
  }

  // Getters for repositories (if needed for testing)
  public getUserRepository(): TypeOrmUserRepository {
    return this.userRepository;
  }

  public getContractRepository(): TypeOrmContractRepository {
    return this.contractRepository;
  }

  public getDocumentTypeRepository(): TypeOrmDocumentTypeRepository {
    return this.documentTypeRepository;
  }
}
