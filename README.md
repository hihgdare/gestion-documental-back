# Gestión Documental - Backend

API REST para sistema de gestión documental de personal desarrollada con **Domain-Driven Design (DDD)** y **Clean Architecture**.

## 🛠️ Tecnologías

- **Runtime**: Bun 1.0+ (JavaScript/TypeScript ultra rápido)
- **Lenguaje**: TypeScript 5.3+
- **Framework**: Express.js 4.18+
- **Base de Datos**: SQL Server
- **ORM**: TypeORM 0.3+
- **Arquitectura**: DDD + Clean Architecture

## 📁 Estructura del Proyecto

```
src/
├── domains/           # Dominios de negocio (User, Contract)
├── shared/           # Código compartido (DB, utils, middleware)
├── presentation/     # Controllers y Routes (API REST)
└── index.ts         # Punto de entrada
```

## 🚀 Instalación

### Prerequisitos
- **Bun**: >= 1.0.0
- **SQL Server**: Cualquier versión compatible

### Pasos

1. **Instalar Bun** (si no lo tienes):
```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

2. **Clonar e instalar dependencias**:
```bash
git clone <repository-url>
cd gestion-documental-back
bun install
```

3. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus credenciales de SQL Server
```

4. **Ejecutar en desarrollo**:
```bash
bun run dev
```

## 🎯 Comandos Principales

```bash
bun run dev      # Desarrollo con hot reload
bun run build    # Compilar para producción
bun start        # Ejecutar en producción
bun test         # Ejecutar tests
```

## 🏗️ Arquitectura

El proyecto implementa **Domain-Driven Design (DDD)** con **Clean Architecture**:

- **Domains**: Lógica de negocio pura (User, Contract)
- **Shared**: Infraestructura compartida
- **Presentation**: API REST endpoints

Esta arquitectura garantiza:
- Separación clara de responsabilidades
- Código testeable y mantenible
- Escalabilidad para nuevos módulos
