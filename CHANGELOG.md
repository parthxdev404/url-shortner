# Changelog

All notable changes to this project will be documented here.

---

# Phase 0 — Backend Foundation

## Sprint 1 — Project Initialization

### Added

- Initialized Node.js + TypeScript project
- Configured strict TypeScript
- Configured ESLint
- Configured Prettier
- Added module path aliases
- Designed scalable project architecture

---

## Sprint 2 — Configuration Layer

### Added

- Environment validation using Envalid
- Logger using Pino
- Configuration layer
- Environment variable management

---

## Sprint 3 — Infrastructure

### Added

- MongoDB integration
- Redis integration
- Docker development environment
- Docker Compose configuration
- Health endpoint
- Graceful startup
- Graceful shutdown

### Fixed

- Docker networking
- Redis container connection
- MongoDB connection handling
- TypeScript path alias issues

---

## Sprint 4 — Express Bootstrap

### Added

- Express application bootstrap
- Middleware registration
- Server lifecycle management

---

## Sprint 5 — Production Middleware

### Added

- Global Error Handler
- Custom Error Classes
- Async Handler
- Request Logger
- Request ID Middleware
- 404 Middleware

### Improved

- Standardized error handling
- Structured request logging

---

## Sprint 6 — API Standards

### Added

- Generic API response helpers
- Success responses
- Error responses
- Created responses
- No Content responses

### Improved

- Consistent API response structure

---

## Sprint 7 — Testing Foundation

### Added

- Vitest
- Supertest
- Integration testing
- Test setup
- First Health API test

### Fixed

- Environment loading during tests

## Phase 3 – Docker & Development Environment ✅

### Added

- Docker development setup
- Docker production setup
- Docker Compose for multi-container orchestration
- MongoDB container
- Redis container
- Docker networking
- Named volumes for persistent storage
- Bind mounts for live development
- Environment variable management using .env
- Multi-stage Docker build (production)

### Fixed

- Incorrect Docker build context
- Missing package-lock.json during build
- TypeScript build output issues
- Missing dist directory in production image
- Incorrect Redis hostname
- Docker networking configuration
- Missing port mapping
- Compose service dependency issues
- Environment variable injection issues

### Learned

- Difference between Docker Image and Container
- Build Context
- Docker Networking
- Service Name vs Container Name
- Bind Mounts vs Volumes
- Docker Compose lifecycle
- Multi-stage builds
- Debugging Docker applications