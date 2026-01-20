import { Request, Response, NextFunction } from 'express';
import { User } from '@domains/user/entities/user.entity';
import { ForbiddenError, UnauthorizedError, ValidationError } from '@shared/domain/errors';

type Body = Request['body'];
type GroupIdHandlers = {
  get?: (body: Body) => any,
  set?: (body: Body, groupId?: number) => void,
};

/**
 * Middleware para asignar un ID de grupo al request basado en el grupo seleccionado del usuario logueado,
 * o desde el body de la request si el usuario tiene el permiso admin:groups.
 * El valor se guarda en el body de la request (default: body.groupId).
 *
 * @param handlers - Objeto con las funciones para extraer y guardar el ID del grupo del body.
 */
export const assignGroup = (handlers?: GroupIdHandlers) => (req: Request, _res: Response, next: NextFunction) => {
  const [ user, groupId, setGroupId ] = init(req, handlers);

  if (user.can('admin:groups')) {
    // Obtiene el grupo del body de la request.
    if (groupId) return setGroupId(groupId), next();
  }

  // Si el usuario tiene grupo asignado, lo almacena y continua.
  const userGroupId = parseId(req.groupId);
  if (userGroupId) return setGroupId(userGroupId), next();

  // Si tiene el permiso admin:groups, devuelve error de validación.
  if (user.can('admin:groups')) {
    throw new ValidationError('El ID del grupo es requerido');
  }

  // Si no tiene el permiso admin:groups, devuelve error de autorización.
  throw new ForbiddenError('Prohibido: No puedes continuar sin un grupo asignado.');
};

/**
 * Middleware para cambiar el ID de grupo si el usuario tiene los permisos user:change:group o admin:groups.
 *
 * @param handlers - Objeto con las funciones para extraer, guardar y remover el ID del grupo del body de la request (default: body.groupId)
 */
export const changeGroup = (handlers?: GroupIdHandlers & {
  unset?: (body: Body) => void,
}) => (req: Request, _res: Response, next: NextFunction) => {
  const [ user, groupId, setGroupId ] = init(req, handlers);
  const unsetGroupId = handlers?.unset ?? ((body: Body) => { delete body.groupId; });

  // Si no existe, se mantiene el grupo actual.
  if (!groupId) return unsetGroupId(req.body), next();

  // Usuarios con los permisos user:change:group o admin:groups pueden cambiar el grupo.
  if (user.can(['user:change:group', 'admin:groups'])) {
    return setGroupId(groupId), next();
  }

  // Si no tienen los permisos, lanzamos error de autorización.
  throw new ForbiddenError('Prohibido: No puedes cambiar el grupo.');
};

/**
 * Middleware para obtener recursos por grupo.
 * Si el usuario tiene los permisos admin:groups, tendrá acceso a obtener recursos de cualquier grupo.
 * Si no tiene los permisos, y no tiene un grupo asignado, devuelve error de autorización.
 */
export const getByGroup = () => (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user as User;
  if (!user) {
    throw new UnauthorizedError();
  }

  const groupId = req.groupId;
  if (!groupId && !user.can('admin:groups')) {
    throw new ForbiddenError('Prohibido: Es necesario que el usuario elija un grupo para consultar este recurso.');
  }

  return next();
};

function init(req: Request, handlers?: GroupIdHandlers) {
  const user = req.user as User;
  if (!user) {
    throw new UnauthorizedError();
  }

  req.body = req.body || {};
  const getter = handlers?.get ?? ((body: Body) => body.groupId);
  const setter = handlers?.set ?? ((body: Body, groupId?: number) => { body.groupId = groupId; });
  return [
    user,
    parseId(getter(req.body)),
    (groupId?: number) => setter(req.body, groupId),
  ] as const;
}

function parseId(value: any): number | null {
  if (!value) return null;
  const id = Number(value);
  return isNaN(id) ? null : id;
}
