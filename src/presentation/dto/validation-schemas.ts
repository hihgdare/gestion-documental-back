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
  employeeId: Joi.string().uuid().required(),
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  type: Joi.string().valid('permanent', 'temporary', 'consultant', 'intern').required(),
  salary: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('CLP'),
  }).required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional(),
  departmentId: Joi.string().uuid().required(),
  managerId: Joi.string().uuid().required(),
});

export const updateContractSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  salary: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).optional(),
  }).optional(),
  endDate: Joi.date().iso().optional(),
}).min(1);

export const getContractByIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});