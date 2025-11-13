import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@shared/infrastructure/database/typeorm.config';
import { UserEntity } from '@shared/infrastructure/database/entities/user.entity';

export async function auth(req: Request, res: Response, next: NextFunction) {
  if (process.env.ENABLE_RBAC !== 'true') return next();
  try {
    const userId = (req.headers['x-user-id'] || req.query.userId) as string | undefined;
    if (!userId) return res.status(401).json({ message: 'unauthorized' });
    const repo = AppDataSource.getRepository(UserEntity);
    const user = await repo.findOne({ where: { id: userId }, relations: ['roles'] });
    if (!user) return res.status(401).json({ message: 'unauthorized' });
    (req as any).user = user;
    next();
  } catch (_e) {
    res.status(401).json({ message: 'unauthorized' });
  }
}
