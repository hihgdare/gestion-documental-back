import { Request, Response, NextFunction } from 'express';
import { User } from '@domains/user/entities/user.entity';
import { ForbiddenError, UnauthorizedError, ValidationError } from '@shared/domain/errors';

// Extiende el tipo Request para incluir la propiedad assignGroupId
declare module 'express-serve-static-core' {
  interface Request {
    assignGroupId?: number;
  }
}

type GroupFieldSelector = (body: any) => any;

/**
 * Middleware para asignar un ID de grupo al request basado en el grupo seleccionado del usuario logueado,
 * o desde el body de la request si el usuario tiene el permiso admin:groups.
 *
 * @param fieldGetter - Función para extraer el ID del grupo del body de la request (default: body.groupId)
 */
export function assignGroup(fieldGetter: GroupFieldSelector = (body) => body.groupId) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    if (!user) {
      throw new UnauthorizedError();
    }
    const dispatchGroupId = dispatcher(req, next);

    if (user.can('admin:groups')) {
      // Obtiene el grupo del body de la request.
      const bodyGroupId = parseId(fieldGetter(req.body));
      if (bodyGroupId) return dispatchGroupId(bodyGroupId);
    }

    // Si el usuario tiene grupo asignado, lo almacena y continua.
    const groupId = parseId(req.groupId);
    if (groupId) return dispatchGroupId(groupId);

    // Si no tiene el permiso admin:groups, devuelve error de autorización.
    if (!user.can('admin:groups')) {
      throw new ForbiddenError('Forbidden: You can\'t proceed without a group assigned.');
    }

    // Devuelve error de validación, ID de grupo requerido.
    throw new ValidationError('El ID del grupo es requerido');
  };
}

/**
 * Middleware para cambiar el ID de grupo si el usuario tiene los permisos user:change:group o admin:groups.
 *
 * @param fieldGetter - Función para extraer el ID del grupo del body de la request (default: body.groupId)
 */
export function changeGroup(fieldGetter: GroupFieldSelector = (body) => body.groupId) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    if (!user) {
      throw new UnauthorizedError();
    }

    // Busca el grupo en el body de la request.
    const id = parseId(fieldGetter(req.body));
    // Si no existe, se mantiene el grupo actual.
    if (!id) return next();

    // Usuarios con los permisos user:change:group o admin:groups pueden cambiar el grupo.
    if (user.can(['user:change:group', 'admin:groups'])) {
      return dispatcher(req, next)(id);
    }

    // Si no tienen los permisos, lanzamos error de autorización.
    throw new ForbiddenError('Forbidden: You can\'t change the group.');
  };
}

const dispatcher = (req: Request, next: NextFunction) => (groupId: number) => {
  req.assignGroupId = groupId;
  return next();
};

function parseId(value: any): number | null {
  if (!value) return null;
  const id = Number(value);
  return isNaN(id) ? null : id;
}
