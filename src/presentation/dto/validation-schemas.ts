import { ContractStatus, ContractType, JornadaTrabajo } from '@domains/contract/value-objects/contract-enums';
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
  startDate: Joi.date().iso().required().min(Joi.ref('$today')).messages({
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
  rutSociedad: Joi.string().trim().min(8).max(12).optional(),
  nombreColaborador: Joi.string().trim().min(2).max(100).optional(),
  contractNumber: Joi.string().trim().min(1).max(50).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')).messages({
    'date.greater': 'endDate should be after startDate.',
  }),
  contractType: Joi.string().valid(...Object.values(ContractType)).optional(),
  administradorContratoMandante: Joi.string().trim().min(2).max(100).optional(),
  administradorContratoEmpresa: Joi.string().trim().min(2).max(100).optional(),
  rutAdministradorContrato: Joi.string().trim().min(8).max(12).optional(),
  nombreMandante: Joi.string().trim().min(2).max(100).optional(),
  descripcionServicio: Joi.string().max(1000).optional(),
  nombreProyecto: Joi.string().max(100).optional(),
  division: Joi.string().trim().max(100).optional(),
  area: Joi.string().max(100).optional(),
  jornadaTrabajo: Joi.string().valid(...Object.values(JornadaTrabajo)).optional(),
  dotacionPersonal: Joi.number().integer().min(0).optional(),
  dotacionVehiculos: Joi.number().integer().min(0).optional(),
}).min(1);

export const getContractByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createColaboratorSchema = Joi.object({
  tipoDocumento: Joi.string().valid('rut', 'pasaporte', 'dni', 'otro').required(),
  numeroDocumento: Joi.string().min(5).max(50).required(),
  nombre: Joi.string().min(2).max(100).required(),
  apellidoPaterno: Joi.string().min(2).max(100).required(),
  apellidoMaterno: Joi.string().min(2).max(100).optional(),
  nacionalidad: Joi.string().min(2).max(100).required(),
  sexo: Joi.string().valid('masculino', 'femenino', 'otro').required(),
  estadoCivil: Joi.string().valid('soltero', 'casado', 'divorciado', 'viudo', 'union_civil').required(),
  fechaNacimiento: Joi.string().isoDate().required(),
  paisResidencia: Joi.string().length(2).required(),
  region: Joi.string().max(100).when('paisResidencia', {
    is: 'CL',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  comuna: Joi.string().max(100).when('paisResidencia', {
    is: 'CL',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  estadoRegion: Joi.string().max(100).when('paisResidencia', {
    is: Joi.not('CL'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  ciudadMunicipio: Joi.string().max(100).when('paisResidencia', {
    is: Joi.not('CL'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  direccionResidencia: Joi.string().min(5).max(255).required(),
  telefono: Joi.string().min(7).max(20).required(),
  email: Joi.string().email().required(),
  contactoEmergencia: Joi.string().max(100).optional(),
  telefonoEmergencia: Joi.string().min(7).max(20).optional(),
  profesion: Joi.string().min(2).max(100).required(),
  cargo: Joi.string().min(2).max(100).required(),
  contractIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'At least one contract is required',
    'any.required': 'Contracts are required',
  }),
});

export const updateColaboratorContractsSchema = Joi.object({
  contractIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'At least one contract is required',
    'any.required': 'Contracts are required',
  }),
});

export const updateColaboratorSchema = Joi.object({
  telefono: Joi.string().min(7).max(20).optional(),
  email: Joi.string().email().optional(),
  direccionResidencia: Joi.string().min(5).max(255).optional(),
  contactoEmergencia: Joi.string().max(100).optional(),
  telefonoEmergencia: Joi.string().min(7).max(20).optional(),
  cargo: Joi.string().min(2).max(100).optional(),
  region: Joi.string().max(100).optional(),
  comuna: Joi.string().max(100).optional(),
  estadoRegion: Joi.string().max(100).optional(),
  ciudadMunicipio: Joi.string().max(100).optional(),
}).min(1);

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
  templateId: Joi.string().uuid().required(),
  colaboratorIds: Joi.array().items(Joi.string().uuid()).optional().allow(null),
  name: Joi.string().min(2).max(255).required(),
  issuedDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'issuedDate must be a valid date',
    }),
  expirationDate: Joi.date()
    .optional()
    .greater(Joi.ref('issuedDate'))
    .allow(null)
    .messages({
      'date.greater': 'expirationDate must be after issuedDate',
      'date.base': 'expirationDate must be a valid date',
    }),
  contractId: Joi.string().uuid().optional().allow(null),
  description: Joi.string().max(1000).optional().allow('', null),
  documentUrl: Joi.string().optional().allow('', null),
}).unknown(true);

export const updateDocumentSchema = Joi.object({
  templateId: Joi.string().uuid().optional(),
  colaboratorIds: Joi.array().items(Joi.string().uuid()).optional().allow(null),
  name: Joi.string().min(2).max(255).optional(),
  issuedDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'issuedDate must be a valid date',
    }),
  expirationDate: Joi.date()
    .optional()
    .greater(Joi.ref('issuedDate'))
    .allow(null)
    .messages({
      'date.base': 'expirationDate must be a valid date',
      'date.greater': 'expirationDate must be after issuedDate',
    }),
  contractId: Joi.string().uuid().optional().allow(null),
  description: Joi.string().max(1000).optional().allow(null, ''),
  documentUrl: Joi.string().optional().allow(null, ''),
}).min(1).unknown(true); // Permitir campos desconocidos

export const createDocumentTemplateSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(2000).optional().allow(null, ''),
  documentTypeId: Joi.string().uuid().required(),
  documentSubtypeId: Joi.string().uuid().required(),
});

export const updateDocumentTemplateSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().max(2000).optional().allow(null, ''),
  documentTypeId: Joi.string().uuid().optional(),
  documentSubtypeId: Joi.string().uuid().optional(),
}).min(1);

export const getDocumentByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const assignDocumentsFromTemplateToGroupSchema = Joi.object({
  templateId: Joi.string().uuid().required(),
  contractId: Joi.string().uuid().required(),
  groupId: Joi.number().integer().required(),
  issuedDate: Joi.date().optional(),
  expirationDate: Joi.date().optional().allow(null),
  name: Joi.string().min(2).max(255).optional(),
  comment: Joi.string().max(1000).optional().allow('', null),
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

export const assignReviewerSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  isPrimary: Joi.boolean().optional().default(false),
  validUntil: Joi.alternatives()
    .try(
      Joi.date().iso().min('now').messages({
        'date.min': 'validUntil must be a future date.',
      }),
      Joi.string().valid('').optional(),
    )
    .optional(),
}).custom((value, helpers) => {
  // Convertir string vacío a undefined
  if (value.validUntil === '') {
    delete value.validUntil;
  }

  // Si no es primario, debe tener validUntil
  if (value.isPrimary === false && !value.validUntil) {
    return helpers.error('any.invalid', {
      message: 'Non-primary reviewers must have a validUntil date',
    });
  }
  // Si es primario, no debe tener validUntil
  if (value.isPrimary === true && value.validUntil) {
    return helpers.error('any.invalid', {
      message: 'Primary reviewers cannot have a validUntil date',
    });
  }
  return value;
});

export const updateReviewerSchema = Joi.object({
  isPrimary: Joi.boolean().optional(),
  validUntil: Joi.date().iso().optional().allow(null).min('now').messages({
    'date.min': 'validUntil must be a future date.',
  }),
}).min(1);

export const createColaboratorGroupSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(1000).optional(),
});

export const updateColaboratorGroupSchema = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().max(1000).optional(),
}).min(1);

export const assignColaboratorsToGroupSchema = Joi.object({
  colaboratorIds: Joi.array().items(Joi.string().uuid()).required(),
});
