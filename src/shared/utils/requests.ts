import { Request } from 'express';

function getHeader(req: Request, headerName: string): string | undefined {
  const value = req.headers[headerName];
  if (Array.isArray(value)) return value.join(',');
  return value?.toLowerCase();
}

function getCookieToken(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;
  const pairs = cookieHeader.split(';');
  const match = pairs.find(p => p.trim().startsWith('token='));
  if (match) {
    const value = match.split('=')[1];
    if (value) return decodeURIComponent(value.trim());
  }
  return null;
}

function getHeaderToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export function getToken(req: Request): string | null {
  return getCookieToken(req) || getHeaderToken(req);
}

/**
 * Se puede habilitar o deshabilitar RBAC con variable de entorno ENABLE_RBAC o con el header x-enable-rbac.
 * - En desarrollo y pruebas, el header tiene prioridad, y puede habilitar/deshabilitar RBAC.
 * - En producción, la variable de entorno tiene prioridad, y el header solo puede habilitar RBAC si está inactiva.
 */
export function isRbacEnabled(req: Request): boolean {
  const enable = getHeader(req, 'x-enable-rbac');
  if (process.env.NODE_ENV === 'production') {
    return process.env.ENABLE_RBAC === 'true' || enable === 'true';
  }
  return enable ? enable === 'true' : process.env.ENABLE_RBAC === 'true';
}
