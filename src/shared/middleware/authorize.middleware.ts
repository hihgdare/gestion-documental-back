import { Request, Response, NextFunction } from 'express';
import { getUserEffectivePermissions } from '@shared/security/authorization';

export function authorize(required: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.ENABLE_RBAC !== 'true') return next();
    const user = (req as any).user as { id: string } | undefined;
    if (!user) return res.status(401).json({ message: 'unauthorized' });
    const perms = await getUserEffectivePermissions(user.id);
    if (!perms.has(required)) return res.status(403).json({ message: 'forbidden' });
    next();
  };
}
