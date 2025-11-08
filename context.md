# Application Context: Document Management API

This document provides a high-level overview of the backend API for the Document Management System.

## 1. Overview

- **Application**: Backend API for a Document Management System.
- **Core Concepts**: The system manages Users, Roles, Permissions, and Contracts.
- **Keywords**: nodejs, express, typescript, ddd, clean-architecture, sqlserver, api.

## 2. Technology Stack

- **Runtime**: Node.js with Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: MySQL (production/development), SQL.js (testing)
- **Testing**: Jest, Supertest
- **Linting/Formatting**: ESLint, Prettier

## 3. Architecture

The application follows the principles of **Domain-Driven Design (DDD)** and **Clean Architecture**. The code is organized into layers with a clear separation of concerns.

### `src/domains` - The Core

This layer contains the core business logic of the application, independent of any framework or external dependency. It's divided into sub-domains:

- **`contract`**: Manages contracts, including entities, repositories (interfaces), and use cases.
- **`permission`**: Manages permissions for roles.
- **`role`**: Manages user roles and their permissions.
- **`user`**: Manages user accounts, profiles, and authentication.

Each domain contains:

- **`entities`**: The core business objects (e.g., `User`, `Contract`).
- **`repositories`**: Interfaces defining the contracts for data persistence (e.g., `ContractRepository`). The actual implementations are in the `infrastructure` layer.
- **`use-cases`**: Encapsulates application-specific business rules. Each use case represents a single, atomic operation.
- **`value-objects`**: Small, immutable objects that represent a single concept (e.g., `Email`, `Salary`).

### `src/presentation` - The Delivery Mechanism

This layer is responsible for handling external interactions, primarily HTTP requests.

- **`controllers`**: Receive incoming HTTP requests, validate input (using DTOs), and orchestrate the execution of the appropriate use cases. They are responsible for returning the HTTP response.
- **`dto` (Data Transfer Objects)**: Classes that define the shape of data coming in and out of the presentation layer. They are used for validation and to decouple the API's public contract from the internal domain models.
- **`routes`**: Defines the API endpoints and maps them to the corresponding controller methods.

### `src/shared/infrastructure` - The Outer Layer

This layer contains the concrete implementations of the interfaces defined in the domain layer. It's where the application interacts with the outside world.

- **`database`**: Contains all TypeORM-related code:
  - `typeorm.config.ts`: Database connection configuration.
  - `entities`: TypeORM entity schemas that map to database tables.
  - `migrations`: Database schema migration files.
- **`repositories`**: Concrete implementations of the repository interfaces defined in the domain layer, using TypeORM to interact with the database (e.g., `TypeOrmContractRepository`).
- **`middleware`**: Express middleware for cross-cutting concerns like error handling (`error-handler.ts`) and request validation (`validation.ts`).

## 4. Key Features & Endpoints

Based on the file structure, the API provides the following features:

- **User Management**:
  - Create, Get, Update, Delete Users.
- **Role Management**:
  - Create, Get, Update, Delete Roles.
  - Assign/Unassign permissions to a role.
- **Contract Management**:
  - Create, Get, Update, Delete Contracts.
  - Activate, Suspend, Terminate Contracts.
  - Advanced filtering (by RUT, collaborator name, mandante, division, area, etc.).
- **Permissions**:
  - Create, Get, Update, Delete Permissions.

The API exposes RESTful endpoints for these resources, defined in the `src/presentation/routes` directory.

## 5. Running the Project

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Testing

```bash
bun test
```

### Build

```bash
bun run build
```

### Production

```bash
bun start
```

## 6. Database Migrations

The project uses TypeORM migrations to manage database schema changes.

- **Create a migration**: `bun run migration:create <migration-name>`
- **Generate a migration from entities**: `bun run migration:generate <migration-name>`
- **Run migrations**: `bun run migration:run`
- **Revert a migration**: `bun run migration:revert`
- **Show migrations**: `bun run migration:show`

## 7. Linting and Formatting

The project uses ESLint for linting and Prettier for formatting.

- **Run linter**: `bun run lint`
- **Fix linting errors**: `bun run lint:fix`
