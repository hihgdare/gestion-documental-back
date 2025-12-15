# Instrucciones Específicas para LLMs en el Proyecto de Gestión Documental Backend

Este documento es exclusivamente para uso de LLMs durante interacciones con el código. Proporciona guías y recordatorios específicos para contribuir efectivamente, evitando repeticiones de información general que está en otros archivos.

## Referencias a Documentación General
- **Resumen del Proyecto, Stack y Arquitectura**: Ver `specs/general.md`.
- **Dominios y Lógica de Negocio**: Ver `specs/dominios.md`.
- **RBAC y Seguridad**: Ver `specs/rbac.md`.
- **Estructura de Carpetas y Cómo Iniciar Módulos**: Ver `specs/carpetas.md`.
- **Pruebas Manuales HTTP**: Ver `specs/http/*.http`.

## Instrucciones para Hacer Cambios de Código
- **Principios Generales**: Mantén DDD y Clean Architecture. El dominio debe ser puro, sin dependencias externas. Usa interfaces para repositorios.
- **Validación**: Emplea DTOs y esquemas en `src/presentation/dto/validation-schemas.ts`. Valida invariantes en entidades y value objects.
- **Errores**: Lanza errores de dominio (e.g., `ValidationError`, `NotFoundError`) desde casos de uso.
- **Testing**: Se realizan pruebas a las rutas. Por lo gen eral se usa base de datos MySQL o SQL.js, lo que queda a elección del usuario.
- **RBAC**: Considera permisos en nuevos endpoints; usa `authorize("perm")` con convención `<modulo>:<accion>`.
- **Convenciones**: Nombres en snake_case para DB (migraciones, columnas), camelCase para TS. Registra dependencias en `dependency-container.ts`.
- **Migraciones**: Asegura que coincidan con entidades ORM; usa `bun run migration:compare` para verificar diferencias.
- **Commits**: Incluye cambios en migraciones si afectan el esquema DB.

## Comandos Post-Cambio (Obligatorios)
Después de cualquier cambio de código, asegúrate de ejecutar los siguientes comandos:
1. Ejecuta `bun run lint:ts` para verificar tipos TypeScript.
2. Ejecuta `bun run lint:fix` para auto-corregir ESLint.
3. Corrige errores relacionados con tus cambios.
4. Ejecuta `bun run test` para verificar pruebas.
5. Si hay errores no relacionados con tus cambios, tanto en codigo como en las pruebas, menciónalos explícitamente (no los corrijas automáticamente a menos que el usuario lo indique).
Esto solo es valido para archivos Typescript modificados, y al final de una tarea, pero antes de hacer commit (en caso de que tengas que hacerlo tú).

## Notas Específicas para LLMs
- **Entidades vs Migraciones**: Verifica alineación; si hay discrepancias, actualiza migraciones para que coincidan (tipos, índices, etc.).
- **Enumerados**: Las bases de datos SQL.js no tienen enumerados de forma nativa, por lo tanto debes utiliza el decorador `@EnumColumn` en las entidades, que se encuentra en `shared/infrastructure/database/entities/utils/decorators.ts`, que se encarga de resolver ese problema.
- **Dependencias**: Siempre registra nuevos componentes en `dependency-container.ts` y rutas en `src/app.ts`.
- **Pruebas**: Usa `supertest` en tests de rutas; incluye pruebas para RBAC si aplica.
- **Configuración**: Revisa `.env.example` para variables necesarias.
- Si necesitas contexto adicional, consulta los archivos referenciados arriba o pregunta al usuario.
