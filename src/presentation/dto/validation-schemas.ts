import { ContractStatus, ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';
import { DateUtils } from '@shared/utils/date';
import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(8).required(),
  roleIds: Joi.array().items(Joi.number().integer()).required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  roleIds: Joi.array().items(Joi.number().integer()).optional(),
}).min(1);

export const getUserByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createContractSchema = Joi.object({
  rutSociedad: Joi.string().trim().min(8).max(12).required(),
  nombreColaborador: Joi.string().trim().min(2).max(100).required(),
  startDate: Joi.date().iso().required().min(DateUtils.todayString()).messages({
    'date.min': 'startDate should be today or later.',
  }),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')).messages({
    'date.greater': 'endDate should be after startDate.',
  }),
  contractType: Joi.string().valid(...Object.values(ContractType)).required(),
  administradorContratoMandante: Joi.string().trim().min(2).max(100).required(),
  administradorContratoEmpresa: Joi.string().trim().min(2).max(100).required(),
  rutAdministradorContrato: Joi.string().trim().min(8).max(12).required(),
  contractNumber: Joi.string().trim().min(1).max(50).required(),
  nombreMandante: Joi.string().trim().min(2).max(100).required(),
  division: Joi.string().trim().max(100).optional(),
  area: Joi.string().max(100).optional(),
  dotacionPersonal: Joi.number().integer().min(0).optional().default(0),
  dotacionVehiculos: Joi.number().integer().min(0).optional().default(0),
  descripcionServicio: Joi.string().max(1000).optional(),
  nombreProyecto: Joi.string().max(100).optional(),
  jornadaTrabajo: Joi.string().valid(...Object.values(JornadaTrabajo)).required(),
  status: Joi.string().valid(...Object.values(ContractStatus)).optional().default(ContractStatus.DRAFT),
});

export const updateContractSchema = Joi.object({
  endDate: Joi.date().iso().optional(),
  nombreColaborador: Joi.string().trim().min(2).max(100).optional(),
  descripcionServicio: Joi.string().max(1000).optional(),
  dotacionPersonal: Joi.number().integer().min(0).optional(),
  dotacionVehiculos: Joi.number().integer().min(0).optional(),
}).min(1);

export const getContractByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createDocumentTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

export const updateDocumentTypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
}).min(1);

export const getDocumentTypeByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createDocumentSubtypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  documentTypeId: Joi.string().uuid().required(),
});

export const updateDocumentSubtypeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  documentTypeId: Joi.string().uuid().optional(),
}).min(1);

export const getDocumentSubtypeByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createDocumentSchema = Joi.object({
  documentTypeId: Joi.string().uuid().required(),
  documentSubtypeId: Joi.string().uuid().required(),
  name: Joi.string().min(2).max(255).required(),
  issuedDate: Joi.date().required().messages({
    'date.base': 'issuedDate must be a valid date',
    'any.required': 'issuedDate is required'
  }),
  expirationDate: Joi.date().optional().greater(Joi.ref('issuedDate')).allow(null).messages({
    'date.greater': 'expirationDate must be after issuedDate',
    'date.base': 'expirationDate must be a valid date'
  }),
  contractId: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional().allow('', null),
  documentUrl: Joi.string().uri().optional().allow('', null),
});

export const updateDocumentSchema = Joi.object({
  documentTypeId: Joi.string().uuid().optional(),
  documentSubtypeId: Joi.string().uuid().optional(),
  name: Joi.string().min(2).max(255).optional(),
  issuedDate: Joi.date().iso().optional(),
  expirationDate: Joi.date().iso().optional(),
  contractId: Joi.string().uuid().optional(),
  description: Joi.string().max(1000).optional().allow(null, ''),
  documentUrl: Joi.string().uri().optional().allow(null, ''),
}).min(1).unknown(true); // Permitir campos desconocidos

export const getDocumentByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255).optional(),
});

export const updatePermissionSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).optional(),
}).min(1);

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255).optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).optional(),
}).min(1);

export const assignPermissionsSchema = Joi.object({
  permissionIds: Joi.array().items(Joi.number().integer()).required(),
});

export const assignRoleToUserSchema = Joi.object({
  roleIds: Joi.array().items(Joi.number().integer()).required(),
});
