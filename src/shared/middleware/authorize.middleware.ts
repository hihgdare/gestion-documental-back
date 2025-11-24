import { Request, Response, NextFunction } from 'express';
import { getUserEffectivePermissions } from '@shared/security/authorization';
import { User } from '@domains/user/entities/user.entity';
import { toArray } from '@shared/utils/array';

// Extend the Request type to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    token?: string;
  }
}

export function authorize(required: string | string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.ENABLE_RBAC !== 'true') return next();
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'unauthorized' });

    // First, check permissions from the user already loaded by auth middleware
    if (user.can(required)) return next();

    // Fallback: recompute from DB (handles cases where relations weren't loaded or cache invalidation)
    const perms = await getUserEffectivePermissions(user.id);
    if (toArray(required).some(perm => perms.has(perm))) return next();
    res.status(403).json({ message: 'forbidden' });
  };
}
