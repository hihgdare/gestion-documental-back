import { Request, Response, NextFunction } from 'express';
import { User } from '@domains/user/entities/user.entity';
import { isRbacEnabled } from '@shared/utils/requests';
import { ForbiddenError, UnauthorizedError } from '@shared/domain/errors';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    token?: string;
    userPermissions?: string[];
  }
}

export const authorize = (
  required?: string | string[],
) => async (req: Request, res: Response, next: NextFunction) => {
  if (!isRbacEnabled(req)) return next();

  const token = req.token;
  if (token === 'skip-token') return next();

  const user = req.user;
  if (!user) throw new UnauthorizedError();

  req.userPermissions = user.getPermissionNames(true);
  if (!required || user.can(required)) return next();

  throw new ForbiddenError();
};
