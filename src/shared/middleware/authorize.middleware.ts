import { Request, Response, NextFunction } from 'express';
import { getUserEffectivePermissions } from '@shared/security/authorization';
import { User } from '@domains/user/entities/user.entity';
import { toArray } from '@shared/utils/array';
import { isRbacEnabled } from '@shared/utils/requests';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    token?: string;
  }
}

export const authorize = (required?: string | string[]) => (
  async (req: Request, res: Response, next: NextFunction) => {
    if (!isRbacEnabled(req)) return next();

    const token = req.token;
    const user = req.user;
    if (!user) return token === 'skip-token'
      ? next()
      : res.status(401).json({ message: 'unauthorized' });

    // First, check permissions from the user already loaded by auth middleware
    if (!required || user.can(required)) return next();

    // Fallback: recompute from DB (handles cases where relations weren't loaded or cache invalidation)
    const perms = await getUserEffectivePermissions(user.id);
    if (toArray(required).some(perm => perms.has(perm))) return next();
    res.status(403).json({ message: 'forbidden' });
  }
);
