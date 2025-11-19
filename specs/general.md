# Contexto de la Aplicación: API de Gestión Documental

Este documento resume, de forma operativa, el backend del Sistema de Gestión Documental.

## 1. Resumen

- Aplicación: API REST para gestión de documentos del personal.
- Conceptos clave: Usuarios, Roles, Permisos, Contratos y Documentos.
- Palabras clave: nodejs, express, typescript, ddd, clean-architecture, mysql, api.

## 2. Stack Tecnológico

- Runtime: Node.js con Bun
- Framework: Express.js
- Lenguaje: TypeScript
- ORM: TypeORM
- Base de datos: MySQL (desarrollo/producción), SQL.js (testing)
- Testing: Jest, Supertest
- Calidad: ESLint, Prettier

## 3. Arquitectura

El proyecto aplica **DDD** y **Clean Architecture**, separando dominio, presentación e infraestructura.

### `src/domains` (Núcleo de negocio)

Subdominios y su propósito:
- `contract`: Entidades, repositorios (interfaces) y casos de uso de contratos.
- `document`: Entidades y casos de uso para documentos.
- `document-type` / `document-subtype`: Tipologías de documentos.
- `permission`: Permisos del sistema.
- `role`: Roles de usuario y asignación de permisos.
- `user`: Usuarios, autenticación y perfiles.

Cada dominio incluye:
- `entities`: Objetos de negocio (p.ej., `User`, `Contract`).
- `repositories`: Interfaces para persistencia (las implementaciones están en infraestructura).
- `use-cases`: Reglas de aplicación (operaciones atómicas).
- `value-objects`: Objetos inmutables (p.ej., `Email`, `Salary`).

### `src/presentation` (Entrega/HTTP)

- `controllers`: Reciben requests, validan con DTO y ejecutan casos de uso.
- `dto`: Contratos públicos de entrada/salida y validación.
- `routes`: Endpoints y mapeo a controladores.

### `src/shared/infrastructure` (Interacción externa)

- `database`: Configuración (`typeorm.config.ts`), entidades ORM y migraciones.
- `repositories`: Implementaciones TypeORM de los repositorios de dominio.
- `middleware`: Cross-cutting (errores, validación, auth/authorize).
- `security`: Autorización y utilidades de RBAC.

## 4. Recursos y Endpoints

Funcionalidad expuesta vía REST (ver `src/presentation/routes`):
- Usuarios: CRUD, login, asignación de roles.
- Roles: CRUD, asignación y consulta de permisos.
- Permisos: CRUD.
- Contratos: CRUD y estados (activar/suspender/terminar), filtros avanzados.
- Documentos, Tipos y Subtipos: CRUD y relaciones.

## 5. Ejecución y Comandos

### Instalación

```bash
bun install
```

### Desarrollo

```bash
bun run dev
```

### Testing (SQL.js in-memory)

```bash
bun test
```

### Build

```bash
bun run build
```

### Producción

```bash
bun start
```

## 6. Migraciones de Base de Datos (TypeORM)

- Crear: `bun run migration:create <nombre>`
- Generar desde entidades: `bun run migration:generate <nombre>`
- Ejecutar: `bun run migration:run`
- Revertir: `bun run migration:revert`
- Mostrar: `bun run migration:show`

## 7. Configuración y Seguridad

- Variables `.env` para MySQL (ver `.env.example`).
- Middlewares de autenticación/autorización en `src/shared/middleware` y utilidades en `src/shared/security`.

## 8. Notas de Diseño

- Patrón Repository para aislar dominio de persistencia.
- Casos de uso como operaciones atómicas y testeables.
