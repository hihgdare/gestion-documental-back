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

export const createColaboratorSchema = Joi.object({
  tipoDocumento: Joi.string().valid('rut', 'pasaporte', 'dni', 'otro').required(),
  numeroDocumento: Joi.string().min(5).max(50).required(),
  nombre: Joi.string().min(2).max(100).required(),
  apellidoPaterno: Joi.string().min(2).max(100).required(),
  apellidoMaterno: Joi.string().min(2).max(100).optional(),
  nacionalidad: Joi.string().min(2).max(100).required(),
  sexo: Joi.string().valid('masculino', 'femenino', 'otro').required(),
  estadoCivil: Joi.string().valid('soltero', 'casado', 'divorciado', 'viudo', 'union_civil').required(),
  fechaNacimiento: Joi.date().iso().max('now').required(),
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
