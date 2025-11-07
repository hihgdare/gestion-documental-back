import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  password: Joi.string().min(8).required(),
  roleId: Joi.string().uuid().required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  roleId: Joi.string().uuid().optional(),
}).min(1);

export const getUserByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const createContractSchema = Joi.object({
  rutSociedad: Joi.string().min(8).max(12).required(),
  nombreColaborador: Joi.string().min(2).max(100).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  contractType: Joi.string().valid('indefinido', 'plazo_fijo', 'obra_faena', 'consultoria', 'honorarios').required(),
  administradorContratoMandante: Joi.string().min(2).max(100).required(),
  administradorContratoEmpresa: Joi.string().min(2).max(100).required(),
  rutAdministradorContrato: Joi.string().min(8).max(12).required(),
  contractNumber: Joi.string().min(1).max(50).required(),
  nombreMandante: Joi.string().min(2).max(100).required(),
  division: Joi.string().max(100).optional(),
  area: Joi.string().max(100).optional(),
  dotacionPersonal: Joi.number().integer().min(0).optional(),
  dotacionVehiculos: Joi.number().integer().min(0).optional(),
  descripcionServicio: Joi.string().max(1000).optional(),
  nombreProyecto: Joi.string().max(100).optional(),
  jornadaTrabajo: Joi.string().valid('completa', 'parcial', 'turno', 'especial').required(),
});

export const updateContractSchema = Joi.object({
  nombreColaborador: Joi.string().min(2).max(100).optional(),
  descripcionServicio: Joi.string().max(1000).optional(),
  dotacionPersonal: Joi.number().integer().min(0).optional(),
  dotacionVehiculos: Joi.number().integer().min(0).optional(),
  endDate: Joi.date().iso().optional(),
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
  issuedDate: Joi.date().iso().required(),
  expirationDate: Joi.date().iso().greater(Joi.ref('issuedDate')).optional(),
  contractId: Joi.string().uuid().required(),
  description: Joi.string().max(1000).optional(),
  documentUrl: Joi.string().uri().optional(),
});

export const updateDocumentSchema = Joi.object({
  documentTypeId: Joi.string().uuid().optional(),
  documentSubtypeId: Joi.string().uuid().optional(),
  name: Joi.string().min(2).max(255).optional(),
  issuedDate: Joi.date().iso().optional(),
  expirationDate: Joi.date().iso().optional(),
  description: Joi.string().max(1000).optional(),
  documentUrl: Joi.string().uri().optional(),
}).min(1);

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
