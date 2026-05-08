// Dependency Injection Container
import { UserController } from '@presentation/controllers/user.controller';
import { ContractController } from '@presentation/controllers/contract.controller';
import { ColaboratorController } from '@presentation/controllers/colaborators.controller';
import { DocumentTypeController } from '@presentation/controllers/document-type.controller';
import { DocumentSubtypeController } from '@presentation/controllers/document-subtype.controller';
import { DocumentController } from '@presentation/controllers/document.controller';
import { AreaController } from '@presentation/controllers/area.controller';
import { DivisionController } from '@presentation/controllers/division.controller';

import { PermissionController } from '@presentation/controllers/permission.controller';
import { RoleController } from '@presentation/controllers/role.controller';
import { ColaboratorGroupController } from '@presentation/controllers/colaborator-group.controller';
import { FamilyController } from '@presentation/controllers/family.controller';
import { DocumentModelController } from '@presentation/controllers/document-model.controller';
import { CompanyController } from '@presentation/controllers/company/company.controller';

// User domain
import { CreateUserUseCase } from '@domains/user/use-cases/create-user.use-case';
import { GetUserByIdUseCase, GetAllUsersUseCase } from '@domains/user/use-cases/get-user.use-case';
import { UpdateUserUseCase, DeleteUserUseCase } from '@domains/user/use-cases/update-user.use-case';
import { AssignRoleToUserUseCase } from '@domains/user/use-cases/assign-role-to-user.use-case';
import { LoginUserUseCase } from '@domains/user/use-cases/login-user.use-case';
import { ChangePasswordUseCase } from '@domains/user/use-cases/change-password.use-case';
import { ServerError } from '@shared/domain/errors';

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
  GetDocumentsByTypeAndSubtypeIdUseCase,
  GetDocumentsByColaboratorIdUseCase,
  GetExpiredDocumentsUseCase,
  GetExpiringDocumentsUseCase,
} from '@domains/document/use-cases/get-document.use-case';
import { UpdateDocumentUseCase, DeleteDocumentUseCase } from '@domains/document/use-cases/update-document.use-case';
import { SendToReviewDocumentUseCase } from '@domains/document/use-cases/send-to-review-document.use-case';
import { ApproveDocumentUseCase } from '@domains/document/use-cases/approve-document.use-case';
import { RejectDocumentUseCase } from '@domains/document/use-cases/reject-document.use-case';
import { RejectDocumentWithCommentsUseCase } from '@domains/document/use-cases/reject-document-with-comments.use-case';
import { CreateDocumentHistoryUseCase as _CreateDocumentHistoryUseCase } from '@domains/document/use-cases/create-document-history.use-case';
import { GetDashboardMetricsUseCase } from '@domains/document/use-cases/get-dashboard-metrics.use-case';
import { GetDocumentHistoryUseCase } from '@domains/document/use-cases/get-document-history.use-case';

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
import { AddSubcontractUseCase } from '@domains/contract/use-cases/add-subcontract.use-case';
import { RemoveSubcontractUseCase } from '@domains/contract/use-cases/remove-subcontract.use-case';
import { GetSubcontractsUseCase } from '@domains/contract/use-cases/get-subcontracts.use-case';
import { GetParentContractsUseCase } from '@domains/contract/use-cases/get-parent-contracts.use-case';
import { AssignReviewerToContractUseCase } from '@domains/contract/use-cases/assign-reviewer-to-contract.use-case';
import { RemoveReviewerFromContractUseCase } from '@domains/contract/use-cases/remove-reviewer-from-contract.use-case';
import { GetContractReviewersUseCase } from '@domains/contract/use-cases/get-contract-reviewers.use-case';
import { CheckUserCanReviewContractUseCase } from '@domains/contract/use-cases/check-user-can-review-contract.use-case';
import { UpdateReviewerUseCase } from '@domains/contract/use-cases/update-reviewer.use-case';
import { AddColaboratorToContractUseCase } from '@domains/contract/use-cases/add-colaborator-to-contract.use-case';
import { RemoveColaboratorFromContractUseCase } from '@domains/contract/use-cases/remove-colaborator-from-contract.use-case';
import { GetContractColaboratorsUseCase } from '@domains/contract/use-cases/get-contract-colaborators.use-case';
import { GetContractDocumentStructureUseCase } from '@domains/contract/use-cases/get-contract-document-structure.use-case';

// Colaborator domain
import { CreateColaboratorUseCase } from '@domains/colaborators/use-cases/create-colaborator.use-case';
import { GetColaboratorUseCase } from '@domains/colaborators/use-cases/get-colaborator.use-case';
import { UpdateColaboratorUseCase, DeleteColaboratorUseCase } from '@domains/colaborators/use-cases/update-colaborator.use-case';
import { GetColaboratorGroupsUseCase } from '@domains/colaborators/use-cases/get-colaborator-groups.use-case';
import { UpdateColaboratorContractsUseCase } from '@domains/colaborators/use-cases/update-colaborator-contracts.use-case';
import { GetContractsByColaboratorUseCase } from '@domains/contract/use-cases/get-contracts-by-colaborator.use-case';

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

// ColaboratorGroup domain
import { SaveColaboratorGroupUseCase } from '@domains/colaborator-group/use-cases/save-colaborator-group.use-case';
import { GetColaboratorGroupByIdUseCase, GetAllColaboratorGroupsUseCase } from '@domains/colaborator-group/use-cases/get-colaborator-group.use-case';
import { UpdateColaboratorGroupUseCase, DeleteColaboratorGroupUseCase } from '@domains/colaborator-group/use-cases/update-colaborator-group.use-case';
import { AssignColaboratorsToGroupUseCase } from '@domains/colaborator-group/use-cases/assign-colaborators-to-group.use-case';
import { GetColaboratorsFromGroupUseCase } from '@domains/colaborator-group/use-cases/get-colaborators-from-group.use-case';

// Family domain
import { CreateFamilyUseCase } from '@domains/family/use-cases/create-family.use-case';
import { GetFamilyByIdUseCase, GetAllFamiliesUseCase } from '@domains/family/use-cases/get-family.use-case';
import { UpdateFamilyUseCase, DeleteFamilyUseCase } from '@domains/family/use-cases/update-family.use-case';
import { AssignDocumentsFromFamilyUseCase } from '@domains/family/use-cases/assign-documents-from-family.use-case';
import { GetFamiliesByContractUseCase } from '@domains/family/use-cases/get-families-by-contract.use-case';

// DocumentModel domain
import { CreateDocumentModelUseCase } from '@domains/document-model/use-cases/create-document-model.use-case';
import {
  GetDocumentModelByIdUseCase,
  GetAllDocumentModelsUseCase,
  GetDocumentModelsByFamilyIdUseCase,
} from '@domains/document-model/use-cases/get-document-model.use-case';
import { UpdateDocumentModelUseCase, DeleteDocumentModelUseCase } from '@domains/document-model/use-cases/update-document-model.use-case';
import { AssignDocumentsFromModelUseCase } from '@domains/document-model/use-cases/assign-documents-from-model.use-case';

// Company domain
import { CreateCompanyUseCase } from '@domains/company/use-cases/create-company.use-case';
import { UpdateCompanyUseCase } from '@domains/company/use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from '@domains/company/use-cases/delete-company.use-case';
import { GetCompanyUseCase } from '@domains/company/use-cases/get-company.use-case';
import { ListCompaniesUseCase } from '@domains/company/use-cases/list-companies.use-case';

// Area domain
import { CreateAreaUseCase } from '@domains/area/use-cases/create-area.use-case';
import { GetAreaUseCase } from '@domains/area/use-cases/get-area.use-case';
import { ListAreasUseCase } from '@domains/area/use-cases/list-areas.use-case';
import { UpdateAreaUseCase } from '@domains/area/use-cases/update-area.use-case';
import { DeleteAreaUseCase } from '@domains/area/use-cases/delete-area.use-case';

// Division domain
import { CreateDivisionUseCase } from '@domains/division/use-cases/create-division.use-case';
import { GetDivisionUseCase } from '@domains/division/use-cases/get-division.use-case';
import { ListDivisionsUseCase } from '@domains/division/use-cases/list-divisions.use-case';
import { UpdateDivisionUseCase } from '@domains/division/use-cases/update-division.use-case';
import { DeleteDivisionUseCase } from '@domains/division/use-cases/delete-division.use-case';

import { TypeOrmFamilyRepository } from '@shared/infrastructure/repositories/typeorm-family.repository';
import { TypeOrmDocumentModelRepository } from '@shared/infrastructure/repositories/typeorm-document-model.repository';
import { TypeOrmGroupRepository } from '@shared/infrastructure/repositories/typeorm-group.repository';
import { TypeOrmAreaRepository } from '@shared/infrastructure/repositories/typeorm-area.repository';
import { TypeOrmDivisionRepository } from '@shared/infrastructure/repositories/typeorm-division.repository';
// Repositories
import { TypeOrmUserRepository } from '@shared/infrastructure/repositories/typeorm-user.repository';
import { TypeOrmColaboratorRepository } from '@shared/infrastructure/repositories/typeorm-colaborator.repository';
import { TypeOrmContractRepository } from '@shared/infrastructure/repositories/typeorm-contract.repository';
import { TypeOrmDocumentTypeRepository } from '@shared/infrastructure/repositories/typeorm-document-type.repository';
import { TypeOrmDocumentSubtypeRepository } from '@shared/infrastructure/repositories/typeorm-document-subtype.repository';
import { TypeOrmDocumentRepository } from '@shared/infrastructure/repositories/typeorm-document.repository';
import { TypeOrmDocumentHistoryRepository } from '@shared/infrastructure/repositories/typeorm-document-history.repository';
import { TypeOrmDocumentFieldValueRepository } from '@shared/infrastructure/repositories/typeorm-document-field-value.repository';
import { TypeOrmCompanyRepository } from '@shared/infrastructure/repositories/typeorm-company.repository';

import { TypeOrmPermissionRepository } from '@shared/infrastructure/repositories/typeorm-permission.repository';
import { TypeOrmRoleRepository } from '@shared/infrastructure/repositories/typeorm-role.repository';
import { TypeOrmContractReviewerRepository } from '@shared/infrastructure/repositories/typeorm-contract-reviewer.repository';
import { TypeOrmColaboratorGroupRepository } from '@shared/infrastructure/repositories/typeorm-colaborator-group.repository';
import { TypeOrmFileRepository } from '@shared/infrastructure/repositories/typeorm-file.repository';
import { GetPermissionsToRoleUseCase } from '@domains/role/use-cases/get-permissions-to-role.use-case';
import { AuthController } from '@presentation/controllers/auth.controller';
import { FileController } from '@presentation/controllers/file.controller';
import { DocumentHistoryController } from '@presentation/controllers/document-history.controller';
import { AssignDocumentsToGroupUseCase } from '@domains/document/use-cases/assign-documents-to-group.use-case';

// Group domain
import { CreateGroupUseCase, GetAllGroupsUseCase } from '@domains/group/use-cases/create-group.use-case';
import { GetGroupByIdUseCase } from '@domains/group/use-cases/get-group.use-case';
import { UpdateGroupUseCase, DeleteGroupUseCase } from '@domains/group/use-cases/update-group.use-case';
import { AddUserToGroupUseCase, RemoveUserFromGroupUseCase, AssignGroupToUserUseCase } from '@domains/group/use-cases/manage-group-users.use-case';
import { GroupController } from '@presentation/controllers/group.controller';

// Bulk Template domain
import { ManageBulkTemplateUseCase } from '@domains/bulk-template/use-cases/manage-bulk-template.use-case';
import { BulkLoadColaboratorsUseCase } from '@domains/bulk-template/use-cases/bulk-load-colaborators.use-case';
import { TypeOrmBulkUploadTemplateRepository } from '@shared/infrastructure/repositories/typeorm-bulk-upload-template.repository';
import { BulkTemplateController } from '@presentation/controllers/bulk-template.controller';

// FileShare domain
import { CreateFileShareUseCase } from '@domains/file-share/use-cases/create-file-share.use-case';
import { GetFileByShareTokenUseCase } from '@domains/file-share/use-cases/get-file-by-share-token.use-case';
import { TypeOrmFileShareRepository } from '@shared/infrastructure/repositories/typeorm-file-share.repository';
import { FileShareController } from '@presentation/controllers/file-share.controller';

// Email
import { NodemailerEmailService } from '@shared/infrastructure/email/nodemailer-email.service';
import { EmailService } from '@shared/infrastructure/email/email-service.interface';

// User extra use cases
import { SetPasswordUseCase } from '@domains/user/use-cases/set-password.use-case';
import { SendActivationEmailUseCase } from '@domains/user/use-cases/send-activation-email.use-case';

// DocumentTemplate domain
import { CreateDocumentTemplateUseCase } from '@domains/document-template/use-cases/create-document-template.use-case';
import {
  GetDocumentTemplateByIdUseCase,
  GetAllDocumentTemplatesUseCase,
  GetDocumentTemplateVersionsUseCase,
} from '@domains/document-template/use-cases/get-document-template.use-case';
import {
  CreateNewDocumentTemplateVersionUseCase,
  DeleteDocumentTemplateUseCase,
} from '@domains/document-template/use-cases/update-document-template.use-case';
import { TypeOrmDocumentTemplateRepository } from '@shared/infrastructure/repositories/typeorm-document-template.repository';
import { DocumentTemplateController } from '@presentation/controllers/document-template.controller';

export class DependencyContainer {
  // Repositories
  private userRepository!: TypeOrmUserRepository;
  private colaboratorRepository!: TypeOrmColaboratorRepository;
  private contractRepository!: TypeOrmContractRepository;
  private documentTypeRepository!: TypeOrmDocumentTypeRepository;
  private documentSubtypeRepository!: TypeOrmDocumentSubtypeRepository;

  private documentRepository!: TypeOrmDocumentRepository;
  private documentHistoryRepository!: TypeOrmDocumentHistoryRepository;
  private documentFieldValueRepository!: TypeOrmDocumentFieldValueRepository;
  private permissionRepository!: TypeOrmPermissionRepository;
  private roleRepository!: TypeOrmRoleRepository;
  private contractReviewerRepository!: TypeOrmContractReviewerRepository;
  private colaboratorGroupRepository!: TypeOrmColaboratorGroupRepository;
  private fileRepository!: TypeOrmFileRepository;
  private familyRepository!: TypeOrmFamilyRepository;
  private documentModelRepository!: TypeOrmDocumentModelRepository;
  private groupRepository!: TypeOrmGroupRepository;
  private companyRepository!: TypeOrmCompanyRepository;
  private areaRepository!: TypeOrmAreaRepository;
  private divisionRepository!: TypeOrmDivisionRepository;
  private bulkUploadTemplateRepository!: TypeOrmBulkUploadTemplateRepository;
  private fileShareRepository!: TypeOrmFileShareRepository;
  private documentTemplateRepository!: TypeOrmDocumentTemplateRepository;

  // Use Cases - BulkTemplate
  private manageBulkTemplateUseCase!: ManageBulkTemplateUseCase;
  private bulkLoadColaboratorsUseCase!: BulkLoadColaboratorsUseCase;

  // Use Cases - DocumentTemplate
  private createDocumentTemplateUseCase!: CreateDocumentTemplateUseCase;
  private getDocumentTemplateByIdUseCase!: GetDocumentTemplateByIdUseCase;
  private getAllDocumentTemplatesUseCase!: GetAllDocumentTemplatesUseCase;
  private getDocumentTemplateVersionsUseCase!: GetDocumentTemplateVersionsUseCase;
  private createNewDocumentTemplateVersionUseCase!: CreateNewDocumentTemplateVersionUseCase;
  private deleteDocumentTemplateUseCase!: DeleteDocumentTemplateUseCase;

  // Use Cases - User
  private createUserUseCase!: CreateUserUseCase;
  private getUserByIdUseCase!: GetUserByIdUseCase;
  private getAllUsersUseCase!: GetAllUsersUseCase;
  private updateUserUseCase!: UpdateUserUseCase;
  private deleteUserUseCase!: DeleteUserUseCase;
  private assignRoleToUserUseCase!: AssignRoleToUserUseCase;
  private loginUserUseCase!: LoginUserUseCase;
  private changePasswordUseCase!: ChangePasswordUseCase;

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
  private getDocumentsByTypeAndSubtypeIdUseCase!: GetDocumentsByTypeAndSubtypeIdUseCase;
  private getDocumentsByColaboratorIdUseCase!: GetDocumentsByColaboratorIdUseCase;
  private getExpiredDocumentsUseCase!: GetExpiredDocumentsUseCase;
  private getExpiringDocumentsUseCase!: GetExpiringDocumentsUseCase;
  private updateDocumentUseCase!: UpdateDocumentUseCase;
  private deleteDocumentUseCase!: DeleteDocumentUseCase;
  private sendToReviewDocumentUseCase!: SendToReviewDocumentUseCase;
  private approveDocumentUseCase!: ApproveDocumentUseCase;
  private rejectDocumentUseCase!: RejectDocumentUseCase;
  private rejectDocumentWithCommentsUseCase!: RejectDocumentWithCommentsUseCase;
  private getDocumentHistoryUseCase!: GetDocumentHistoryUseCase;
  private getDashboardMetricsUseCase!: GetDashboardMetricsUseCase;
  private assignDocumentsToGroupUseCase!: AssignDocumentsToGroupUseCase;


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
  private addSubcontractUseCase!: AddSubcontractUseCase;
  private removeSubcontractUseCase!: RemoveSubcontractUseCase;
  private getSubcontractsUseCase!: GetSubcontractsUseCase;
  private getParentContractsUseCase!: GetParentContractsUseCase;
  private assignReviewerToContractUseCase!: AssignReviewerToContractUseCase;
  private removeReviewerFromContractUseCase!: RemoveReviewerFromContractUseCase;
  private getContractReviewersUseCase!: GetContractReviewersUseCase;
  private checkUserCanReviewContractUseCase!: CheckUserCanReviewContractUseCase;
  private updateReviewerUseCase!: UpdateReviewerUseCase;
  private addColaboratorToContractUseCase!: AddColaboratorToContractUseCase;
  private removeColaboratorFromContractUseCase!: RemoveColaboratorFromContractUseCase;
  private getContractColaboratorsUseCase!: GetContractColaboratorsUseCase;
  private getContractDocumentStructureUseCase!: GetContractDocumentStructureUseCase;

  // Use Cases - Colaborator
  private createColaboratorUseCase!: CreateColaboratorUseCase;
  private getColaboratorUseCase!: GetColaboratorUseCase;
  private updateColaboratorUseCase!: UpdateColaboratorUseCase;
  private deleteColaboratorUseCase!: DeleteColaboratorUseCase;
  private getColaboratorGroupsUseCase!: GetColaboratorGroupsUseCase;
  private updateColaboratorContractsUseCase!: UpdateColaboratorContractsUseCase;
  private getContractsByColaboratorUseCase!: GetContractsByColaboratorUseCase;

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

  // Use Cases - ColaboratorGroup
  private saveColaboratorGroupUseCase!: SaveColaboratorGroupUseCase;
  private getColaboratorGroupByIdUseCase!: GetColaboratorGroupByIdUseCase;
  private getAllColaboratorGroupsUseCase!: GetAllColaboratorGroupsUseCase;
  private updateColaboratorGroupUseCase!: UpdateColaboratorGroupUseCase;
  private deleteColaboratorGroupUseCase!: DeleteColaboratorGroupUseCase;
  private assignColaboratorsToGroupUseCase!: AssignColaboratorsToGroupUseCase;
  private getColaboratorsFromGroupUseCase!: GetColaboratorsFromGroupUseCase;

  // Use Cases - Family
  private createFamilyUseCase!: CreateFamilyUseCase;
  private getFamilyByIdUseCase!: GetFamilyByIdUseCase;
  private getAllFamiliesUseCase!: GetAllFamiliesUseCase;
  private updateFamilyUseCase!: UpdateFamilyUseCase;
  private deleteFamilyUseCase!: DeleteFamilyUseCase;
  private assignDocumentsFromFamilyUseCase!: AssignDocumentsFromFamilyUseCase;
  private getFamiliesByContractUseCase!: GetFamiliesByContractUseCase;

  // Use Cases - DocumentModel
  private createDocumentModelUseCase!: CreateDocumentModelUseCase;
  private getDocumentModelByIdUseCase!: GetDocumentModelByIdUseCase;
  private getAllDocumentModelsUseCase!: GetAllDocumentModelsUseCase;
  private getDocumentModelsByFamilyIdUseCase!: GetDocumentModelsByFamilyIdUseCase;
  private updateDocumentModelUseCase!: UpdateDocumentModelUseCase;
  private deleteDocumentModelUseCase!: DeleteDocumentModelUseCase;
  private assignDocumentsFromModelUseCase!: AssignDocumentsFromModelUseCase;

  // Use Cases - Group
  private createGroupUseCase!: CreateGroupUseCase;
  private getGroupByIdUseCase!: GetGroupByIdUseCase;
  private getAllGroupsUseCase!: GetAllGroupsUseCase;
  private updateGroupUseCase!: UpdateGroupUseCase;
  private deleteGroupUseCase!: DeleteGroupUseCase;
  private addUserToGroupUseCase!: AddUserToGroupUseCase;
  private removeUserFromGroupUseCase!: RemoveUserFromGroupUseCase;
  private assignGroupToUserUseCase!: AssignGroupToUserUseCase;

  // Use Cases - Company
  private createCompanyUseCase!: CreateCompanyUseCase;
  private updateCompanyUseCase!: UpdateCompanyUseCase;
  private deleteCompanyUseCase!: DeleteCompanyUseCase;
  private getCompanyUseCase!: GetCompanyUseCase;
  private listCompaniesUseCase!: ListCompaniesUseCase;

  // Use Cases - Area
  private createAreaUseCase!: CreateAreaUseCase;
  private getAreaUseCase!: GetAreaUseCase;
  private listAreasUseCase!: ListAreasUseCase;
  private updateAreaUseCase!: UpdateAreaUseCase;
  private deleteAreaUseCase!: DeleteAreaUseCase;

  // Use Cases - Division
  private createDivisionUseCase!: CreateDivisionUseCase;
  private getDivisionUseCase!: GetDivisionUseCase;
  private listDivisionsUseCase!: ListDivisionsUseCase;
  private updateDivisionUseCase!: UpdateDivisionUseCase;
  private deleteDivisionUseCase!: DeleteDivisionUseCase;

  // Controllers
  private colaboratorController!: ColaboratorController;
  private contractController!: ContractController;
  private documentTypeController!: DocumentTypeController;
  private documentSubtypeController!: DocumentSubtypeController;
  private documentController!: DocumentController;
  private documentHistoryController!: DocumentHistoryController;

  private permissionController!: PermissionController;
  private roleController!: RoleController;
  private colaboratorGroupController!: ColaboratorGroupController;
  private familyController!: FamilyController;
  private documentModelController!: DocumentModelController;
  private groupController!: GroupController;
  private userController!: UserController;
  private authController!: AuthController;
  private companyController!: CompanyController;
  private areaController!: AreaController;
  private divisionController!: DivisionController;
  private fileController!: FileController;
  private bulkTemplateController!: BulkTemplateController;
  private fileShareController!: FileShareController;
  private documentTemplateController!: DocumentTemplateController;

  // Use Cases - FileShare
  private createFileShareUseCase!: CreateFileShareUseCase;
  private getFileByShareTokenUseCase!: GetFileByShareTokenUseCase;

  // Services
  private emailService!: EmailService;

  // Extra user use cases
  private setPasswordUseCase!: SetPasswordUseCase;
  private sendActivationEmailUseCase!: SendActivationEmailUseCase;

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
    this.contractReviewerRepository = new TypeOrmContractReviewerRepository();
    this.colaboratorGroupRepository = new TypeOrmColaboratorGroupRepository();
    this.fileRepository = new TypeOrmFileRepository();
    this.familyRepository = new TypeOrmFamilyRepository();
    this.documentModelRepository = new TypeOrmDocumentModelRepository();
    this.groupRepository = new TypeOrmGroupRepository();
    this.companyRepository = new TypeOrmCompanyRepository();
    this.areaRepository = new TypeOrmAreaRepository();
    this.divisionRepository = new TypeOrmDivisionRepository();
    this.bulkUploadTemplateRepository = new TypeOrmBulkUploadTemplateRepository();
    this.fileShareRepository = new TypeOrmFileShareRepository();
    this.documentTemplateRepository = new TypeOrmDocumentTemplateRepository();

    // Initialize User use cases
    this.createUserUseCase = new CreateUserUseCase(this.userRepository, this.roleRepository, this.groupRepository);
    this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
    this.updateUserUseCase = new UpdateUserUseCase(this.userRepository, this.roleRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(this.userRepository);
    this.assignRoleToUserUseCase = new AssignRoleToUserUseCase(this.userRepository, this.roleRepository);
    this.loginUserUseCase = new LoginUserUseCase(this.userRepository);
    this.changePasswordUseCase = new ChangePasswordUseCase(this.userRepository);

    // Initialize Email service and extra user use cases (must be before controllers)
    this.emailService = new NodemailerEmailService();
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new ServerError('JWT_SECRET is not configured');
    }
    this.setPasswordUseCase = new SetPasswordUseCase(this.userRepository, jwtSecret);
    this.sendActivationEmailUseCase = new SendActivationEmailUseCase(
      this.userRepository,
      this.emailService,
      jwtSecret,
      process.env.FRONTEND_URL ?? '',
    );

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
    this.documentFieldValueRepository = new TypeOrmDocumentFieldValueRepository();
    this.createDocumentUseCase = new CreateDocumentUseCase(
      this.documentRepository,
      this.documentHistoryRepository,
      this.groupRepository,
      this.documentModelRepository,
      this.familyRepository,
      this.documentFieldValueRepository,
    );
    this.getDocumentByIdUseCase = new GetDocumentByIdUseCase(this.documentRepository);
    this.getAllDocumentsUseCase = new GetAllDocumentsUseCase(this.documentRepository);
    this.getDocumentsByContractIdUseCase = new GetDocumentsByContractIdUseCase(this.documentRepository);
    this.getDocumentsByTypeAndSubtypeIdUseCase = new GetDocumentsByTypeAndSubtypeIdUseCase(this.documentRepository);
    this.getDocumentsByColaboratorIdUseCase = new GetDocumentsByColaboratorIdUseCase(this.documentRepository);
    this.getExpiredDocumentsUseCase = new GetExpiredDocumentsUseCase(this.documentRepository);
    this.getExpiringDocumentsUseCase = new GetExpiringDocumentsUseCase(this.documentRepository);
    this.updateDocumentUseCase = new UpdateDocumentUseCase(
      this.documentRepository,
      this.documentHistoryRepository,
      this.groupRepository,
      this.documentModelRepository,
      this.fileRepository,
      this.documentFieldValueRepository,
    );
    this.deleteDocumentUseCase = new DeleteDocumentUseCase(this.documentRepository);
    this.sendToReviewDocumentUseCase = new SendToReviewDocumentUseCase(this.documentRepository, this.documentHistoryRepository);
    this.approveDocumentUseCase = new ApproveDocumentUseCase(this.documentRepository, this.documentHistoryRepository);
    this.rejectDocumentUseCase = new RejectDocumentUseCase(this.documentRepository, this.documentHistoryRepository);
    this.rejectDocumentWithCommentsUseCase = new RejectDocumentWithCommentsUseCase(this.documentRepository, this.documentHistoryRepository);
    this.getDocumentHistoryUseCase = new GetDocumentHistoryUseCase(this.documentHistoryRepository);
    this.getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(this.documentRepository);
    this.assignDocumentsToGroupUseCase = new AssignDocumentsToGroupUseCase(
      this.documentRepository,
      this.documentHistoryRepository,
      this.contractRepository,
      this.colaboratorRepository,
      this.documentModelRepository,
      this.familyRepository,
    );


    // Initialize Contract use cases
    this.createContractUseCase = new CreateContractUseCase(this.contractRepository, this.groupRepository);
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
    this.updateContractUseCase = new UpdateContractUseCase(this.contractRepository, this.groupRepository);
    this.activateContractUseCase = new ActivateContractUseCase(this.contractRepository);
    this.suspendContractUseCase = new SuspendContractUseCase(this.contractRepository);
    this.terminateContractUseCase = new TerminateContractUseCase(this.contractRepository);
    this.deleteContractUseCase = new DeleteContractUseCase(this.contractRepository);
    this.addSubcontractUseCase = new AddSubcontractUseCase(this.contractRepository);
    this.removeSubcontractUseCase = new RemoveSubcontractUseCase(this.contractRepository);
    this.getSubcontractsUseCase = new GetSubcontractsUseCase(this.contractRepository);
    this.getParentContractsUseCase = new GetParentContractsUseCase(this.contractRepository);
    this.assignReviewerToContractUseCase = new AssignReviewerToContractUseCase(
      this.contractReviewerRepository,
      this.contractRepository,
      this.userRepository,
    );
    this.removeReviewerFromContractUseCase = new RemoveReviewerFromContractUseCase(
      this.contractReviewerRepository,
    );
    this.getContractReviewersUseCase = new GetContractReviewersUseCase(
      this.contractReviewerRepository,
    );
    this.checkUserCanReviewContractUseCase = new CheckUserCanReviewContractUseCase(
      this.contractReviewerRepository,
    );
    this.updateReviewerUseCase = new UpdateReviewerUseCase(
      this.contractReviewerRepository,
    );
    this.addColaboratorToContractUseCase = new AddColaboratorToContractUseCase(this.contractRepository);
    this.removeColaboratorFromContractUseCase = new RemoveColaboratorFromContractUseCase(this.contractRepository);
    this.getContractColaboratorsUseCase = new GetContractColaboratorsUseCase(this.contractRepository);
    this.getContractDocumentStructureUseCase = new GetContractDocumentStructureUseCase(
      this.contractRepository,
      this.documentModelRepository,
      this.documentRepository,
    );

    // Initialize Colaborator use cases
    this.createColaboratorUseCase = new CreateColaboratorUseCase(this.colaboratorRepository, this.groupRepository);
    this.getColaboratorUseCase = new GetColaboratorUseCase(this.colaboratorRepository);
    this.updateColaboratorUseCase = new UpdateColaboratorUseCase(this.colaboratorRepository, this.groupRepository);
    this.deleteColaboratorUseCase = new DeleteColaboratorUseCase(this.colaboratorRepository);
    this.updateColaboratorContractsUseCase = new UpdateColaboratorContractsUseCase(this.colaboratorRepository);
    this.getContractsByColaboratorUseCase = new GetContractsByColaboratorUseCase(this.contractRepository);

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
    this.deleteRoleUseCase = new DeleteRoleUseCase(this.roleRepository, this.userRepository);
    this.assignPermissionsToRoleUseCase = new AssignPermissionsToRoleUseCase(
      this.roleRepository,
      this.permissionRepository,
    );
    this.getPermissionsToRoleUseCase = new GetPermissionsToRoleUseCase(
      this.roleRepository,
    );

    // Initialize ColaboratorGroup use cases
    this.saveColaboratorGroupUseCase = new SaveColaboratorGroupUseCase(this.colaboratorGroupRepository);
    this.getColaboratorGroupByIdUseCase = new GetColaboratorGroupByIdUseCase(this.colaboratorGroupRepository);
    this.getAllColaboratorGroupsUseCase = new GetAllColaboratorGroupsUseCase(this.colaboratorGroupRepository);
    this.updateColaboratorGroupUseCase = new UpdateColaboratorGroupUseCase(this.colaboratorGroupRepository);
    this.deleteColaboratorGroupUseCase = new DeleteColaboratorGroupUseCase(this.colaboratorGroupRepository);
    this.assignColaboratorsToGroupUseCase = new AssignColaboratorsToGroupUseCase(
      this.colaboratorGroupRepository,
      this.colaboratorRepository,
    );
    this.getColaboratorsFromGroupUseCase = new GetColaboratorsFromGroupUseCase(
      this.colaboratorGroupRepository,
    );

    // Initialize Colaborator use case that needs ColaboratorGroup repository
    this.getColaboratorGroupsUseCase = new GetColaboratorGroupsUseCase(
      this.colaboratorRepository,
      this.colaboratorGroupRepository,
    );

    // Initialize Controllers
    this.colaboratorController = new ColaboratorController(
      this.createColaboratorUseCase,
      this.getColaboratorUseCase,
      this.updateColaboratorUseCase,
      this.deleteColaboratorUseCase,
      this.getColaboratorGroupsUseCase,
      this.updateColaboratorContractsUseCase,
      this.getContractsByColaboratorUseCase,
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
      this.addSubcontractUseCase,
      this.removeSubcontractUseCase,
      this.getSubcontractsUseCase,
      this.assignReviewerToContractUseCase,
      this.removeReviewerFromContractUseCase,
      this.getContractReviewersUseCase,
      this.updateReviewerUseCase,
      this.getUserByIdUseCase,
      this.addColaboratorToContractUseCase,
      this.removeColaboratorFromContractUseCase,
      this.getContractColaboratorsUseCase,
      this.getParentContractsUseCase,
      this.getContractDocumentStructureUseCase,
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
      this.getDocumentsByTypeAndSubtypeIdUseCase,
      this.getDocumentsByColaboratorIdUseCase,
      this.getExpiredDocumentsUseCase,
      this.getExpiringDocumentsUseCase,
      this.updateDocumentUseCase,
      this.deleteDocumentUseCase,
      this.sendToReviewDocumentUseCase,
      this.approveDocumentUseCase,
      this.rejectDocumentUseCase,
      this.rejectDocumentWithCommentsUseCase,
      this.contractReviewerRepository,
      this.getAllDocumentTypesWithSubtypesUseCase,
      this.getDashboardMetricsUseCase,
      this.assignDocumentsToGroupUseCase,
    );

    this.documentHistoryController = new DocumentHistoryController(
      this.getDocumentHistoryUseCase,
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

    this.colaboratorGroupController = new ColaboratorGroupController(
      this.saveColaboratorGroupUseCase,
      this.getColaboratorGroupByIdUseCase,
      this.getAllColaboratorGroupsUseCase,
      this.updateColaboratorGroupUseCase,
      this.deleteColaboratorGroupUseCase,
      this.assignColaboratorsToGroupUseCase,
      this.getColaboratorsFromGroupUseCase,
    );

    // Initialize Family use cases
    this.createFamilyUseCase = new CreateFamilyUseCase(this.familyRepository, this.groupRepository, this.contractRepository);
    this.getFamilyByIdUseCase = new GetFamilyByIdUseCase(this.familyRepository);
    this.getAllFamiliesUseCase = new GetAllFamiliesUseCase(this.familyRepository);
    this.updateFamilyUseCase = new UpdateFamilyUseCase(this.familyRepository, this.groupRepository, this.contractRepository);
    this.deleteFamilyUseCase = new DeleteFamilyUseCase(this.familyRepository);
    this.assignDocumentsFromFamilyUseCase = new AssignDocumentsFromFamilyUseCase(
      this.familyRepository,
      this.documentModelRepository,
      this.documentRepository,
      this.documentHistoryRepository,
      this.contractRepository,
      this.colaboratorRepository,
    );
    this.getFamiliesByContractUseCase = new GetFamiliesByContractUseCase(this.familyRepository);

    this.familyController = new FamilyController(
      this.createFamilyUseCase,
      this.getFamilyByIdUseCase,
      this.getAllFamiliesUseCase,
      this.updateFamilyUseCase,
      this.deleteFamilyUseCase,
      this.assignDocumentsFromFamilyUseCase,
      this.getFamiliesByContractUseCase,
    );

    // Initialize DocumentModel use cases
    this.createDocumentModelUseCase = new CreateDocumentModelUseCase(
      this.documentModelRepository,
      this.familyRepository,
    );
    this.getDocumentModelByIdUseCase = new GetDocumentModelByIdUseCase(this.documentModelRepository);
    this.getAllDocumentModelsUseCase = new GetAllDocumentModelsUseCase(this.documentModelRepository);
    this.getDocumentModelsByFamilyIdUseCase = new GetDocumentModelsByFamilyIdUseCase(this.documentModelRepository);
    this.updateDocumentModelUseCase = new UpdateDocumentModelUseCase(this.documentModelRepository);
    this.deleteDocumentModelUseCase = new DeleteDocumentModelUseCase(this.documentModelRepository);
    this.assignDocumentsFromModelUseCase = new AssignDocumentsFromModelUseCase(
      this.documentModelRepository,
      this.documentRepository,
      this.documentHistoryRepository,
      this.contractRepository,
      this.colaboratorRepository,
      this.familyRepository,
    );

    this.documentModelController = new DocumentModelController(
      this.createDocumentModelUseCase,
      this.getDocumentModelByIdUseCase,
      this.getAllDocumentModelsUseCase,
      this.getDocumentModelsByFamilyIdUseCase,
      this.updateDocumentModelUseCase,
      this.deleteDocumentModelUseCase,
      this.assignDocumentsFromModelUseCase,
    );

    // Initialize Group use cases
    this.createGroupUseCase = new CreateGroupUseCase(this.groupRepository);
    this.getGroupByIdUseCase = new GetGroupByIdUseCase(this.groupRepository);
    this.getAllGroupsUseCase = new GetAllGroupsUseCase(this.groupRepository);
    this.updateGroupUseCase = new UpdateGroupUseCase(this.groupRepository);
    this.deleteGroupUseCase = new DeleteGroupUseCase(this.groupRepository);
    this.addUserToGroupUseCase = new AddUserToGroupUseCase(this.groupRepository, this.userRepository);
    this.removeUserFromGroupUseCase = new RemoveUserFromGroupUseCase(this.groupRepository, this.userRepository);
    this.assignGroupToUserUseCase = new AssignGroupToUserUseCase(this.groupRepository, this.userRepository);

    this.groupController = new GroupController(
      this.createGroupUseCase,
      this.getGroupByIdUseCase,
      this.getAllGroupsUseCase,
      this.updateGroupUseCase,
      this.deleteGroupUseCase,
      this.addUserToGroupUseCase,
      this.removeUserFromGroupUseCase,
      this.assignGroupToUserUseCase,
    );

    // Initialize Company use cases
    this.createCompanyUseCase = new CreateCompanyUseCase(this.companyRepository, this.groupRepository);
    this.updateCompanyUseCase = new UpdateCompanyUseCase(this.companyRepository, this.groupRepository);
    this.deleteCompanyUseCase = new DeleteCompanyUseCase(this.companyRepository);
    this.getCompanyUseCase = new GetCompanyUseCase(this.companyRepository);
    this.listCompaniesUseCase = new ListCompaniesUseCase(this.companyRepository);

    this.companyController = new CompanyController(
      this.createCompanyUseCase,
      this.updateCompanyUseCase,
      this.deleteCompanyUseCase,
      this.getCompanyUseCase,
      this.listCompaniesUseCase,
    );

    // Initialize Area use cases
    this.createAreaUseCase = new CreateAreaUseCase(this.areaRepository);
    this.getAreaUseCase = new GetAreaUseCase(this.areaRepository);
    this.listAreasUseCase = new ListAreasUseCase(this.areaRepository);
    this.updateAreaUseCase = new UpdateAreaUseCase(this.areaRepository);
    this.deleteAreaUseCase = new DeleteAreaUseCase(this.areaRepository);

    this.areaController = new AreaController(
      this.createAreaUseCase,
      this.getAreaUseCase,
      this.listAreasUseCase,
      this.updateAreaUseCase,
      this.deleteAreaUseCase,
    );

    // Initialize Division use cases
    this.createDivisionUseCase = new CreateDivisionUseCase(this.divisionRepository);
    this.getDivisionUseCase = new GetDivisionUseCase(this.divisionRepository);
    this.listDivisionsUseCase = new ListDivisionsUseCase(this.divisionRepository);
    this.updateDivisionUseCase = new UpdateDivisionUseCase(this.divisionRepository);
    this.deleteDivisionUseCase = new DeleteDivisionUseCase(this.divisionRepository);

    this.divisionController = new DivisionController(
      this.createDivisionUseCase,
      this.getDivisionUseCase,
      this.listDivisionsUseCase,
      this.updateDivisionUseCase,
      this.deleteDivisionUseCase,
    );

    this.userController = new UserController(
      this.createUserUseCase,
      this.getUserByIdUseCase,
      this.getAllUsersUseCase,
      this.updateUserUseCase,
      this.deleteUserUseCase,
      this.assignRoleToUserUseCase,
      this.sendActivationEmailUseCase,
    );

    this.authController = new AuthController(
      this.loginUserUseCase,
      this.getUserByIdUseCase,
      this.updateUserUseCase,
      this.changePasswordUseCase,
      this.groupRepository,
      this.setPasswordUseCase,
    );

    this.fileController = new FileController(this.fileRepository);

    // Initialize FileShare
    this.createFileShareUseCase = new CreateFileShareUseCase(this.fileShareRepository, this.fileRepository);
    this.getFileByShareTokenUseCase = new GetFileByShareTokenUseCase(this.fileShareRepository, this.fileRepository);
    this.fileShareController = new FileShareController(this.createFileShareUseCase, this.getFileByShareTokenUseCase);

    // Initialize BulkTemplate
    this.manageBulkTemplateUseCase = new ManageBulkTemplateUseCase(this.bulkUploadTemplateRepository);
    this.bulkLoadColaboratorsUseCase = new BulkLoadColaboratorsUseCase(
      this.contractRepository,
      this.colaboratorRepository,
      this.createColaboratorUseCase,
      this.createUserUseCase,
    );
    this.bulkTemplateController = new BulkTemplateController(
      this.manageBulkTemplateUseCase,
      this.fileRepository,
      this.bulkUploadTemplateRepository,
      this.bulkLoadColaboratorsUseCase,
    );

    // Initialize DocumentTemplate use cases
    this.createDocumentTemplateUseCase = new CreateDocumentTemplateUseCase(
      this.documentTemplateRepository,
      this.groupRepository,
    );
    this.getDocumentTemplateByIdUseCase = new GetDocumentTemplateByIdUseCase(this.documentTemplateRepository);
    this.getAllDocumentTemplatesUseCase = new GetAllDocumentTemplatesUseCase(this.documentTemplateRepository);
    this.getDocumentTemplateVersionsUseCase = new GetDocumentTemplateVersionsUseCase(this.documentTemplateRepository);
    this.createNewDocumentTemplateVersionUseCase = new CreateNewDocumentTemplateVersionUseCase(this.documentTemplateRepository);
    this.deleteDocumentTemplateUseCase = new DeleteDocumentTemplateUseCase(this.documentTemplateRepository);

    this.documentTemplateController = new DocumentTemplateController(
      this.createDocumentTemplateUseCase,
      this.getDocumentTemplateByIdUseCase,
      this.getAllDocumentTemplatesUseCase,
      this.getDocumentTemplateVersionsUseCase,
      this.createNewDocumentTemplateVersionUseCase,
      this.deleteDocumentTemplateUseCase,
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

  public getDocumentHistoryController(): DocumentHistoryController {
    return this.documentHistoryController;
  }

  public getPermissionController(): PermissionController {
    return this.permissionController;
  }

  public getRoleController(): RoleController {
    return this.roleController;
  }

  public getColaboratorGroupController(): ColaboratorGroupController {
    return this.colaboratorGroupController;
  }

  public getFamilyController(): FamilyController {
    return this.familyController;
  }

  public getDocumentModelController(): DocumentModelController {
    return this.documentModelController;
  }

  public getGroupController(): GroupController {
    return this.groupController;
  }

  public getAuthController(): AuthController {
    return this.authController;
  }

  public getFileController(): FileController {
    return this.fileController;
  }

  public getCompanyController(): CompanyController {
    return this.companyController;
  }

  public getAreaController(): AreaController {
    return this.areaController;
  }

  public getDivisionController(): DivisionController {
    return this.divisionController;
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

  public getGroupRepository(): TypeOrmGroupRepository {
    return this.groupRepository;
  }

  public getCompanyRepository(): TypeOrmCompanyRepository {
    return this.companyRepository;
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

  public getChangePasswordUseCase(): ChangePasswordUseCase {
    return this.changePasswordUseCase;
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

  public getCheckUserCanReviewContractUseCase(): CheckUserCanReviewContractUseCase {
    return this.checkUserCanReviewContractUseCase;
  }

  public getAddUserToGroupUseCase(): AddUserToGroupUseCase {
    return this.addUserToGroupUseCase;
  }

  public getCreateGroupUseCase(): CreateGroupUseCase {
    return this.createGroupUseCase;
  }

  public getBulkTemplateController(): BulkTemplateController {
    return this.bulkTemplateController;
  }

  public getFileShareController(): FileShareController {
    return this.fileShareController;
  }

  public getEmailService(): EmailService {
    return this.emailService;
  }

  public getDocumentTemplateController(): DocumentTemplateController {
    return this.documentTemplateController;
  }
}
