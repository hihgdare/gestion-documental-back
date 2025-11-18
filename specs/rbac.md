# Sistema de Roles y Permisos (RBAC)

## Objetivos

- Roles jerárquicos con herencia de permisos.
- Protección de endpoints por permisos.
- Caché de permisos efectivos por usuario.
- Compatibilidad retro con clientes existentes mediante flag.

## Activación

- Flag de entorno: `ENABLE_RBAC=true` para habilitar autenticación/autorización.
- Por defecto (`false`), los endpoints permanecen sin verificación (retrocompatibilidad).

## Modelo de Datos

- `roles`
  - `id`, `name` (único), `description`, `created_at`, `updated_at`.
  - `parent_id` (opcional) referencia a `roles.id` para jerarquía.
- `permissions`
  - `id`, `name` (único), `description`, timestamps.
- `role_permissions` (M:N)
  - `role_id`, `permission_id`.
- `user_roles` (M:N)
  - `user_id`, `role_id`.

## Herencia de Permisos

- Un usuario hereda los permisos de todos sus roles.
- Cada rol hereda los permisos de su `parent` recursivamente.
- Algoritmo: unión de nombres de permisos propios + ancestrales.

## Middleware

- `auth`: exige cabecera `x-user-id` y adjunta el usuario a la request.
- `authorize("perm")`: valida el permiso efectivo del usuario.
- Uso en rutas:
  - Roles: `role:create|read|update|delete|assign_permissions`.
  - Permisos: `permission:create|read|update|delete`.

## Caché

- Caché en memoria con TTL (60s) por usuario.
- Invalida automáticamente por expiración o manualmente.

## Endpoints protegidos

- `/api/roles` y `/api/permissions` con permisos específicos por operación.
- Extensible al resto de módulos siguiendo el mismo patrón.

## Migración y compatibilidad

- El sistema puede convivir con clientes antiguos: desactivar RBAC (`ENABLE_RBAC=false`).
- Recomendación: añadir `parent_id` en producción vía migración.
- Verificar existencia de `user_roles` para M:N entre usuarios y roles.

## Pruebas

- Integración: autorización, 401/403, herencia `parent→child`.
- Controladores existentes siguen pasando con RBAC desactivado.

## Buenas prácticas

- Definir un catálogo de permisos por módulo.
- Asignar permisos a roles (no a usuarios directamente).
- Usar caché distribuido (Redis) en producción.
