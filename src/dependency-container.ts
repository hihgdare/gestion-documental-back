// Dependency Injection Container
import { UserController } from '@presentation/controllers/user.controller';
import { ContractController } from '@presentation/controllers/contract.controller';
import { ColaboratorController } from '@presentation/controllers/colaborators.controller';
import { DocumentTypeController } from '@presentation/controllers/document-type.controller';
import { DocumentSubtypeController } from '@presentation/controllers/document-subtype.controller';
import { DocumentController } from '@presentation/controllers/document.controller';
import { PermissionController } from '@presentation/controllers/permission.controller';
import { RoleController } from '@presentation/controllers/role.controller';

// User domain
import { CreateUserUseCase } from '@domains/user/use-cases/create-user.use-case';
import { GetUserByIdUseCase, GetAllUsersUseCase } from '@domains/user/use-cases/get-user.use-case';
import { UpdateUserUseCase, DeleteUserUseCase } from '@domains/user/use-cases/update-user.use-case';
import { AssignRoleToUserUseCase } from '@domains/user/use-cases/assign-role-to-user.use-case';
import { LoginUserUseCase } from '@domains/user/use-cases/login-user.use-case';
import { GetAuthenticatedUserPermissionsUseCase } from '@domains/user/use-cases/get-authenticated-user-permissions.use-case';

// DocumentType domain
import { CreateDocumentTypeUseCase } from '@domains/document-type/use-cases/create-document-type.use-case';
import { GetDocumentTypeByIdUseCase, GetAllDocumentTypesUseCase } from '@domains/document-type/use-cases/get-document-type.use-case';
import { UpdateDocumentTypeUseCase, DeleteDocumentTypeUseCase } from '@domains/document-type/use-cases/update-document-type.use-case';
import {
  GetDocumentTypeWithSubtypesUseCase,
  GetAllDocumentTypesWithSubtypesUseCase,
} from '@domains/document-type/use-cases/get-document-type-with-subtypes.use-case';

// DocumentSubtype domain
import { CreateDocumentSubtypeUseCase } from '@domains/document-subtype/use-cases/create-document-subtype.use-case';
import {
  GetDocumentSubtypeByIdUseCase,
  GetAllDocumentSubtypesUseCase,
  GetDocumentSubtypesByDocumentTypeIdUseCase,
} from '@domains/document-subtype/use-cases/get-document-subtype.use-case';
import { UpdateDocumentSubtypeUseCase, DeleteDocumentSubtypeUseCase } from '@domains/document-subtype/use-cases/update-document-subtype.use-case';

// Document domain
import { CreateDocumentUseCase } from '@domains/document/use-cases/create-document.use-case';
import {
  GetDocumentByIdUseCase,
  GetAllDocumentsUseCase,
  GetDocumentsByContractIdUseCase,
  GetDocumentsByDocumentTypeIdUseCase,
  GetDocumentsByDocumentSubtypeIdUseCase,
  GetExpiredDocumentsUseCase,
  GetExpiringDocumentsUseCase,
} from '@domains/document/use-cases/get-document.use-case';
import { UpdateDocumentUseCase, DeleteDocumentUseCase } from '@domains/document/use-cases/update-document.use-case';
import { CreateDocumentHistoryUseCase as _CreateDocumentHistoryUseCase } from '@domains/document/use-cases/create-document-history.use-case';
import { GetDocumentHistoryUseCase as _GetDocumentHistoryUseCase } from '@domains/document/use-cases/get-document-history.use-case';

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

// Colaborator domain
import { CreateColaboratorUseCase } from '@domains/colaborators/use-cases/create-colaborator.use-case';
import { GetColaboratorUseCase } from '@domains/colaborators/use-cases/get-colaborator.use-case';
import { UpdateColaboratorUseCase } from '@domains/colaborators/use-cases/update-colaborator.use-case';

// Permission domain
import { FindAllPermissionsUseCase, FindPermissionByIdUseCase } from '@domains/permission/use-cases/find-permission.use-case';
import { SavePermissionUseCase } from '@domains/permission/use-cases/save-permission.use-case';
import { UpdatePermissionUseCase } from '@domains/permission/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from '@domains/permission/use-cases/delete-permission.use-case';

// Role domain
import { SaveRoleUseCase } from '@domains/role/use-cases/save-role.use-case';
import { GetRoleByIdUseCase, GetAllRolesUseCase } from '@domains/role/use-cases/get-role.use-case';
import { UpdateRoleUseCase, DeleteRoleUseCase } from '@domains/role/use-cases/update-role.use-case';
import { AssignPermissionsToRoleUseCase } from '@domains/role/use-cases/assign-permissions-to-role.use-case';

// Repositories
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';
import { TypeOrmColaboratorRepository } from '@shared/infrastructure/repositories/typeorm-colaborator.repository';
import { TypeOrmContractRepository } from '@shared/infrastructure/repositories/typeorm-contract.repository';
import { TypeOrmDocumentTypeRepository } from '@shared/infrastructure/repositories/typeorm-document-type.repository';
import { TypeOrmDocumentSubtypeRepository } from '@shared/infrastructure/repositories/typeorm-document-subtype.repository';
import { TypeOrmDocumentRepository } from '@shared/infrastructure/repositories/typeorm-document.repository';
import { TypeOrmDocumentHistoryRepository } from '@shared/infrastructure/repositories/typeorm-document-history.repository';
import { TypeOrmPermissionRepository } from '@shared/infrastructure/repositories/typeorm-permission.repository';
import { TypeOrmRoleRepository } from '@shared/infrastructure/repositories/typeorm-role.repository';
import { GetPermissionsToRoleUseCase } from '@domains/role/use-cases/get-permissions-to-role.use-case';
import { AuthController } from '@presentation/controllers/auth.controller';

export class DependencyContainer {
  // Repositories
  private userRepository!: TypeOrmUserRepository;
  private colaboratorRepository!: TypeOrmColaboratorRepository;
  private contractRepository!: TypeOrmContractRepository;
  private documentTypeRepository!: TypeOrmDocumentTypeRepository;
  private documentSubtypeRepository!: TypeOrmDocumentSubtypeRepository;
  private documentRepository!: TypeOrmDocumentRepository;
  private documentHistoryRepository!: TypeOrmDocumentHistoryRepository;
  private permissionRepository!: TypeOrmPermissionRepository;
  private roleRepository!: TypeOrmRoleRepository;

  // Use Cases - User
  private createUserUseCase!: CreateUserUseCase;
  private getUserByIdUseCase!: GetUserByIdUseCase;
  private getAllUsersUseCase!: GetAllUsersUseCase;
  private updateUserUseCase!: UpdateUserUseCase;
  private deleteUserUseCase!: DeleteUserUseCase;
  private assignRoleToUserUseCase!: AssignRoleToUserUseCase;
  private loginUserUseCase!: LoginUserUseCase;
  private getAuthenticatedUserPermissionsUseCase!: GetAuthenticatedUserPermissionsUseCase;

  // Use Cases - DocumentType
  private createDocumentTypeUseCase!: CreateDocumentTypeUseCase;
  private getDocumentTypeByIdUseCase!: GetDocumentTypeByIdUseCase;
  private getAllDocumentTypesUseCase!: GetAllDocumentTypesUseCase;
  private updateDocumentTypeUseCase!: UpdateDocumentTypeUseCase;
  private deleteDocumentTypeUseCase!: DeleteDocumentTypeUseCase;
  private getDocumentTypeWithSubtypesUseCase!: GetDocumentTypeWithSubtypesUseCase;
  private getAllDocumentTypesWithSubtypesUseCase!: GetAllDocumentTypesWithSubtypesUseCase;

  // Use Cases - DocumentSubtype
  private createDocumentSubtypeUseCase!: CreateDocumentSubtypeUseCase;
  private getDocumentSubtypeByIdUseCase!: GetDocumentSubtypeByIdUseCase;
  private getAllDocumentSubtypesUseCase!: GetAllDocumentSubtypesUseCase;
  private getDocumentSubtypesByDocumentTypeIdUseCase!: GetDocumentSubtypesByDocumentTypeIdUseCase;
  private updateDocumentSubtypeUseCase!: UpdateDocumentSubtypeUseCase;
  private deleteDocumentSubtypeUseCase!: DeleteDocumentSubtypeUseCase;

  // Use Cases - Document
  private createDocumentUseCase!: CreateDocumentUseCase;
  private getDocumentByIdUseCase!: GetDocumentByIdUseCase;
  private getAllDocumentsUseCase!: GetAllDocumentsUseCase;
  private getDocumentsByContractIdUseCase!: GetDocumentsByContractIdUseCase;
  private getDocumentsByDocumentTypeIdUseCase!: GetDocumentsByDocumentTypeIdUseCase;
  private getDocumentsByDocumentSubtypeIdUseCase!: GetDocumentsByDocumentSubtypeIdUseCase;
  private getExpiredDocumentsUseCase!: GetExpiredDocumentsUseCase;
  private getExpiringDocumentsUseCase!: GetExpiringDocumentsUseCase;
  private updateDocumentUseCase!: UpdateDocumentUseCase;
  private deleteDocumentUseCase!: DeleteDocumentUseCase;

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

  // Use Cases - Colaborator
  private createColaboratorUseCase!: CreateColaboratorUseCase;
  private getColaboratorUseCase!: GetColaboratorUseCase;
  private updateColaboratorUseCase!: UpdateColaboratorUseCase;

  // Use Cases - Permission
  private savePermissionUseCase!: SavePermissionUseCase;
  private findAllPermissionsUseCase!: FindAllPermissionsUseCase;
  private findPermissionByIdUseCase!: FindPermissionByIdUseCase;
  private updatePermissionUseCase!: UpdatePermissionUseCase;
  private deletePermissionUseCase!: DeletePermissionUseCase;

  // Use Cases - Role
  private saveRoleUseCase!: SaveRoleUseCase;
  private getRoleByIdUseCase!: GetRoleByIdUseCase;
  private getAllRolesUseCase!: GetAllRolesUseCase;
  private updateRoleUseCase!: UpdateRoleUseCase;
  private deleteRoleUseCase!: DeleteRoleUseCase;
  private assignPermissionsToRoleUseCase!: AssignPermissionsToRoleUseCase;
  private getPermissionsToRoleUseCase!: GetPermissionsToRoleUseCase;

  // Controllers
  private colaboratorController!: ColaboratorController;
  private contractController!: ContractController;
  private documentTypeController!: DocumentTypeController;
  private documentSubtypeController!: DocumentSubtypeController;
  private documentController!: DocumentController;
  private permissionController!: PermissionController;
  private roleController!: RoleController;
  private userController!: UserController;
  private authController!: AuthController;

  public async initialize(): Promise<void> {
    // Initialize repositories
    this.userRepository = new TypeOrmUserRepository();
    this.contractRepository = new TypeOrmContractRepository();
    this.colaboratorRepository = new TypeOrmColaboratorRepository();
    this.documentTypeRepository = new TypeOrmDocumentTypeRepository();
    this.documentSubtypeRepository = new TypeOrmDocumentSubtypeRepository();
    this.documentRepository = new TypeOrmDocumentRepository();
    this.documentHistoryRepository = new TypeOrmDocumentHistoryRepository();
    this.permissionRepository = new TypeOrmPermissionRepository();
    this.roleRepository = new TypeOrmRoleRepository();

    // Initialize User use cases
    this.createUserUseCase = new CreateUserUseCase(this.userRepository, this.roleRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository, this.roleRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
    this.assignRoleToUserUseCase = new AssignRoleToUserUseCase(this.userRepository, this.roleRepository);
    this.loginUserUseCase = new LoginUserUseCase(this.userRepository);
    this.getAuthenticatedUserPermissionsUseCase = new GetAuthenticatedUserPermissionsUseCase();

    // Initialize DocumentType use cases
    this.createDocumentTypeUseCase = new CreateDocumentTypeUseCase(this.documentTypeRepository);
    this.getDocumentTypeByIdUseCase = new GetDocumentTypeByIdUseCase(this.documentTypeRepository);
    this.getAllDocumentTypesUseCase = new GetAllDocumentTypesUseCase(this.documentTypeRepository);
    this.updateDocumentTypeUseCase = new UpdateDocumentTypeUseCase(this.documentTypeRepository);
    this.deleteDocumentTypeUseCase = new DeleteDocumentTypeUseCase(this.documentTypeRepository);
    this.getDocumentTypeWithSubtypesUseCase = new GetDocumentTypeWithSubtypesUseCase(
      this.documentTypeRepository,
      this.documentSubtypeRepository,
    );
    this.getAllDocumentTypesWithSubtypesUseCase = new GetAllDocumentTypesWithSubtypesUseCase(
      this.documentTypeRepository,
      this.documentSubtypeRepository,
    );

    // Initialize DocumentSubtype use cases
    this.createDocumentSubtypeUseCase = new CreateDocumentSubtypeUseCase(this.documentSubtypeRepository);
    this.getDocumentSubtypeByIdUseCase = new GetDocumentSubtypeByIdUseCase(this.documentSubtypeRepository);
    this.getAllDocumentSubtypesUseCase = new GetAllDocumentSubtypesUseCase(this.documentSubtypeRepository);
    this.getDocumentSubtypesByDocumentTypeIdUseCase = new GetDocumentSubtypesByDocumentTypeIdUseCase(this.documentSubtypeRepository);
    this.updateDocumentSubtypeUseCase = new UpdateDocumentSubtypeUseCase(this.documentSubtypeRepository);
    this.deleteDocumentSubtypeUseCase = new DeleteDocumentSubtypeUseCase(this.documentSubtypeRepository);

    // Initialize Document use cases
    this.createDocumentUseCase = new CreateDocumentUseCase(this.documentRepository, this.documentHistoryRepository);
    this.getDocumentByIdUseCase = new GetDocumentByIdUseCase(this.documentRepository);
    this.getAllDocumentsUseCase = new GetAllDocumentsUseCase(this.documentRepository);
    this.getDocumentsByContractIdUseCase = new GetDocumentsByContractIdUseCase(this.documentRepository);
    this.getDocumentsByDocumentTypeIdUseCase = new GetDocumentsByDocumentTypeIdUseCase(this.documentRepository);
    this.getDocumentsByDocumentSubtypeIdUseCase = new GetDocumentsByDocumentSubtypeIdUseCase(this.documentRepository);
    this.getExpiredDocumentsUseCase = new GetExpiredDocumentsUseCase(this.documentRepository);
    this.getExpiringDocumentsUseCase = new GetExpiringDocumentsUseCase(this.documentRepository);
    this.updateDocumentUseCase = new UpdateDocumentUseCase(this.documentRepository, this.documentHistoryRepository);
    this.deleteDocumentUseCase = new DeleteDocumentUseCase(this.documentRepository);

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

    // Initialize Colaborator use cases
    this.createColaboratorUseCase = new CreateColaboratorUseCase(this.colaboratorRepository);
    this.getColaboratorUseCase = new GetColaboratorUseCase(this.colaboratorRepository);
    this.updateColaboratorUseCase = new UpdateColaboratorUseCase(this.colaboratorRepository);

    // Initialize Permission use cases
    this.savePermissionUseCase = new SavePermissionUseCase(this.permissionRepository);
    this.findAllPermissionsUseCase = new FindAllPermissionsUseCase(this.permissionRepository);
    this.findPermissionByIdUseCase = new FindPermissionByIdUseCase(this.permissionRepository);
    this.updatePermissionUseCase = new UpdatePermissionUseCase(this.permissionRepository);
    this.deletePermissionUseCase = new DeletePermissionUseCase(this.permissionRepository);

    // Initialize Role use cases
    this.saveRoleUseCase = new SaveRoleUseCase(this.roleRepository);
    this.getRoleByIdUseCase = new GetRoleByIdUseCase(this.roleRepository);
    this.getAllRolesUseCase = new GetAllRolesUseCase(this.roleRepository);
    this.updateRoleUseCase = new UpdateRoleUseCase(this.roleRepository);
    this.deleteRoleUseCase = new DeleteRoleUseCase(this.roleRepository);
    this.assignPermissionsToRoleUseCase = new AssignPermissionsToRoleUseCase(
      this.roleRepository,
      this.permissionRepository,
    );
    this.getPermissionsToRoleUseCase = new GetPermissionsToRoleUseCase(
      this.roleRepository,
    );

    // Initialize Controllers
    this.colaboratorController = new ColaboratorController(
      this.createColaboratorUseCase,
      this.getColaboratorUseCase,
      this.updateColaboratorUseCase,
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
      this.getDocumentTypeWithSubtypesUseCase,
      this.getAllDocumentTypesWithSubtypesUseCase,
    );

    this.documentSubtypeController = new DocumentSubtypeController(
      this.createDocumentSubtypeUseCase,
      this.getDocumentSubtypeByIdUseCase,
      this.getAllDocumentSubtypesUseCase,
      this.getDocumentSubtypesByDocumentTypeIdUseCase,
      this.updateDocumentSubtypeUseCase,
      this.deleteDocumentSubtypeUseCase,
    );

    this.documentController = new DocumentController(
      this.createDocumentUseCase,
      this.getDocumentByIdUseCase,
      this.getAllDocumentsUseCase,
      this.getDocumentsByContractIdUseCase,
      this.getDocumentsByDocumentTypeIdUseCase,
      this.getDocumentsByDocumentSubtypeIdUseCase,
      this.getExpiredDocumentsUseCase,
      this.getExpiringDocumentsUseCase,
      this.updateDocumentUseCase,
      this.deleteDocumentUseCase,
    );

    this.permissionController = new PermissionController(
      this.savePermissionUseCase,
      this.findPermissionByIdUseCase,
      this.findAllPermissionsUseCase,
      this.updatePermissionUseCase,
      this.deletePermissionUseCase,
    );

    this.roleController = new RoleController(
      this.saveRoleUseCase,
      this.getRoleByIdUseCase,
      this.getAllRolesUseCase,
      this.updateRoleUseCase,
      this.deleteRoleUseCase,
      this.assignPermissionsToRoleUseCase,
      this.getPermissionsToRoleUseCase,
    );

    this.userController = new UserController(
      this.createUserUseCase,
      this.getUserByIdUseCase,
      this.getAllUsersUseCase,
      this.updateUserUseCase,
      this.deleteUserUseCase,
      this.assignRoleToUserUseCase,
    );

    this.authController = new AuthController(
      this.loginUserUseCase,
      this.getAuthenticatedUserPermissionsUseCase,
    );
  }

  // Getters for controllers
  public getUserController(): UserController {
    return this.userController;
  }

  public getContractController(): ContractController {
    return this.contractController;
  }

  public getColaboratorController(): ColaboratorController {
    return this.colaboratorController;
  }

  public getDocumentTypeController(): DocumentTypeController {
    return this.documentTypeController;
  }

  public getDocumentSubtypeController(): DocumentSubtypeController {
    return this.documentSubtypeController;
  }

  public getDocumentController(): DocumentController {
    return this.documentController;
  }

  public getPermissionController(): PermissionController {
    return this.permissionController;
  }

  public getRoleController(): RoleController {
    return this.roleController;
  }

  public getAuthController(): AuthController {
    return this.authController;
  }

  // Getters for repositories (if needed for testing)
  public getUserRepository(): TypeOrmUserRepository {
    return this.userRepository;
  }

  public getContractRepository(): TypeOrmContractRepository {
    return this.contractRepository;
  }

  public getColaboratorRepository(): TypeOrmColaboratorRepository {
    return this.colaboratorRepository;
  }

  public getDocumentTypeRepository(): TypeOrmDocumentTypeRepository {
    return this.documentTypeRepository;
  }

  public getDocumentSubtypeRepository(): TypeOrmDocumentSubtypeRepository {
    return this.documentSubtypeRepository;
  }

  public getDocumentRepository(): TypeOrmDocumentRepository {
    return this.documentRepository;
  }

  public getPermissionRepository(): TypeOrmPermissionRepository {
    return this.permissionRepository;
  }

  public getRoleRepository(): TypeOrmRoleRepository {
    return this.roleRepository;
  }

  // Getters for specific Use Cases (if needed for testing or direct access)
  public getCreateUserUseCase(): CreateUserUseCase {
    return this.createUserUseCase;
  }

  public getLoginUserUseCase(): LoginUserUseCase {
    return this.loginUserUseCase;
  }

  public getSaveRoleUseCase(): SaveRoleUseCase {
    return this.saveRoleUseCase;
  }

  public getSavePermissionUseCase(): SavePermissionUseCase {
    return this.savePermissionUseCase;
  }

  public getAssignPermissionsToRoleUseCase(): AssignPermissionsToRoleUseCase {
    return this.assignPermissionsToRoleUseCase;
  }
}
