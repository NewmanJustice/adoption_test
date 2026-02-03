# Story — Developer Environment Setup

## User Story

As a **developer** joining the Adoption Digital Platform project,
I want to **clone the repository, install dependencies, and start the application locally**,
So that **I can begin development work within 10 minutes without environment configuration issues**.

---

## Context / Scope

- **Actor:** Developer (new or existing team member)
- **Feature:** Project Scaffold
- **Relates to:** System Spec Section 12.8 (Deployment Pipeline - Local Development)
- **This story establishes:** The foundational developer experience from repository clone to running application

### What This Story Delivers
- Monorepo structure with `/client`, `/server`, `/shared`, `/docker` directories
- Root `package.json` with npm workspaces configuration
- Docker Compose configuration for local services
- Environment variable templates (`.env.example` files)
- Clear documentation for getting started

### Entry Conditions
- Developer has access to the repository
- Developer has Docker Desktop (or equivalent) installed
- Developer has Node.js 20 LTS installed

### Exit Conditions
- Application is running locally
- Developer can access the frontend and backend services

---

## Acceptance Criteria

**AC-1 — Repository structure is correct**
- Given I have cloned the repository,
- When I examine the directory structure,
- Then I see the following top-level directories:
  - `/client` (React frontend application)
  - `/server` (Express backend application)
  - `/shared` (Shared code between client and server)
  - `/docker` (Docker configuration files)

**AC-2 — npm workspaces are configured**
- Given I have cloned the repository,
- When I examine the root `package.json`,
- Then it contains a `workspaces` configuration including `client`, `server`, and `shared`.

**AC-3 — Dependencies install successfully**
- Given I have cloned the repository,
- When I run `npm install` from the root directory,
- Then all dependencies for client, server, and shared packages are installed without errors,
- And the `node_modules` directory is created.

**AC-4 — Environment variables are documented**
- Given I have cloned the repository,
- When I examine the project,
- Then I find `.env.example` files in:
  - Root directory (common variables)
  - `/server` directory (server-specific variables)
- And each `.env.example` contains documented placeholder values for all required variables.

**AC-5 — Docker Compose starts all services**
- Given I have copied `.env.example` to `.env` with appropriate values,
- When I run `docker-compose up`,
- Then the following services start:
  - PostgreSQL database container
  - (Optional) Any other infrastructure services
- And the services are accessible on their configured ports.

**AC-6 — Application starts in development mode**
- Given Docker Compose services are running,
- And I have installed dependencies,
- When I run `npm run dev` from the root directory,
- Then the Express server starts on port 3001 (or configured PORT),
- And the React development server starts on port 3000,
- And both servers show ready/listening messages.

**AC-7 — Hot-reload is functional**
- Given the application is running in development mode,
- When I modify a source file in `/client` or `/server`,
- Then the change is detected and the application reloads within 2 seconds,
- And I do not need to manually restart the server.

**AC-8 — Missing environment variables cause clear errors**
- Given required environment variables are not set,
- When I attempt to start the application,
- Then the application fails to start with a clear error message,
- And the error message lists the missing required variables.

**AC-9 — Docker startup completes within timeout**
- Given I have a standard development machine,
- When I run `docker-compose up`,
- Then all services are ready within 60 seconds.

**AC-10 — Node.js version is enforced**
- Given the repository is cloned,
- When I examine the project configuration,
- Then I find a `.nvmrc` file specifying Node 20 LTS,
- And `package.json` contains an `engines` field specifying the Node version.

---

## Technical Notes

### npm Scripts (Root package.json)
The following scripts should be available:
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm install` - Install all workspace dependencies

### Docker Compose Services
- PostgreSQL 15.x container with persistent volume
- Ports should be configurable via environment variables with sensible defaults

### Environment Variable Categories
Required variables should include:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment indicator (development/test/production)
- `PORT` - Server port (default 3001)

---

## Out of Scope

- CI/CD pipeline configuration (separate infrastructure feature)
- Production environment configuration
- IDE-specific configuration files (e.g., `.vscode/`)
- Pre-commit hooks or linting enforcement (covered in other stories)
- Authentication configuration (separate feature)

---

## Dependencies

- None (this is the foundational story)

---

## Definition of Done

- [ ] Repository structure matches specification
- [ ] `npm install` completes without errors
- [ ] `docker-compose up` starts PostgreSQL successfully
- [ ] `npm run dev` starts both client and server
- [ ] Hot-reload works for both client and server changes
- [ ] Missing environment variables produce clear error messages
- [ ] Total time from clone to running application is under 10 minutes
