import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { validateRequest } from '@shared/middleware/validation';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../dto/validation-schemas';
import { auth } from '@shared/middleware/auth.middleware';
import { authorize } from '@shared/middleware/authorize.middleware';

export const createCompanyRoutes = (companyController: CompanyController): Router => {
  const router = Router();
  router.use(auth);

  // POST /api/companies - Create a new company
  router.post('/', authorize('company:create'), validateRequest(createCompanySchema), companyController.createCompany);

  // GET /api/companies - Get all companies
  router.get('/', authorize('company:read'), companyController.getAllCompanies);

  // GET /api/companies/:id - Get company by ID
  router.get('/:id', authorize('company:read'), companyController.getCompanyById);

  // PUT /api/companies/:id - Update company
  router.put('/:id', authorize('company:update'), validateRequest(updateCompanySchema), companyController.updateCompany);

  // DELETE /api/companies/:id - Delete company
  router.delete('/:id', authorize('company:delete'), companyController.deleteCompany);

  return router;
};
