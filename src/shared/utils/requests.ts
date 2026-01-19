import { Request } from 'express';

function getHeader(headers: Request['headers'] | undefined, headerName: string): string | undefined {
  const value = headers?.[headerName];
  if (Array.isArray(value)) return value.join(',');
  return value?.toLowerCase();
}

function getHeaderToken(headers?: Request['headers']): string | null {
  const authHeader = headers?.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

export const getToken = (headers?: Request['headers'], cookies?: Record<string, string>): string | null => (
  cookies?.token || getHeaderToken(headers)
);

/**
 * Se puede habilitar o deshabilitar RBAC con variable de entorno ENABLE_RBAC o con el header x-enable-rbac.
 * - En desarrollo y pruebas, el header tiene prioridad, y puede habilitar/deshabilitar RBAC.
 * - En producción, la variable de entorno tiene prioridad, y el header solo puede habilitar RBAC si está inactiva.
 */
export function isRbacEnabled(req: Request): boolean {
  const enable = getHeader(req.headers, 'x-enable-rbac');
  if (process.env.NODE_ENV === 'production') {
    return process.env.ENABLE_RBAC === 'true' || enable === 'true';
  }
  return enable ? enable === 'true' : process.env.ENABLE_RBAC === 'true';
}

export function parseCookies(req: Request): Record<string, string> | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader || typeof cookieHeader !== 'string') return undefined;
  const pairs = cookieHeader.split(';');
  const cookies: Record<string, string> = {};
  pairs.forEach(pair => {
    const [key, value] = pair.trim().split('=');
    cookies[key] = value;
  });
  return Object.keys(cookies).length > 0 ? cookies : undefined;
}
