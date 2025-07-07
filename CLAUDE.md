# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDS Maker is an open source platform for creating, validating, and processing Philippine Civil Service Commission (CSC) Personal Data Sheets (PDS) with automatic formatting correction. The platform implements CSC Form No. 212 (Revised 2017) requirements to prevent PDS rejections due to formatting errors.

## Commands

### Root Level (Monorepo)
```bash
npm install         # Install all dependencies (API + Web)
npm run dev         # Start both API and web development servers
npm run build       # Build both API and web for production
npm test            # Run all test suites
npm run lint        # Lint all TypeScript/JavaScript files
npm run lint:fix    # Fix linting issues automatically
npm run docker:run  # Run with Docker Compose
```

### API Development (`cd api/`)
```bash
npm run dev              # Start API with nodemon (auto-reload)
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled JavaScript from dist/
npm test                 # Run Jest test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
npm run migrate          # Run database migrations
npm run migrate:rollback # Rollback database migrations
npm run seed             # Run database seeds
```

## Architecture

This is an **API-first monorepo** with the following structure:
- `api/` - Express.js backend with TypeScript (implemented)
- `web/` - React.js frontend (to be implemented)
- `mobile-sdk/` - React Native/Flutter SDKs (future)

The backend follows a **layered architecture**:
- **Routes** (`api/src/routes/`) - API endpoints with OpenAPI/Swagger documentation
- **Controllers** (`api/src/controllers/`) - Request handling logic
- **Services** (`api/src/services/`) - Business logic (validation, file processing)
- **Repositories** (`api/src/repositories/`) - Data access layer with Knex ORM
- **Models** (`api/src/models/`) - TypeScript interfaces
- **Middleware** (`api/src/middleware/`) - Auth, validation, error handling
- **Database** (`api/src/database/`) - Migrations, seeds, connections

## Path Aliases

The API uses TypeScript path aliases configured in `api/tsconfig.json`:
- `@/*` maps to `api/src/*`
- `@/controllers/*` maps to `api/src/controllers/*`
- `@/services/*` maps to `api/src/services/*`
- etc.

Always use these aliases when importing files within the API.

## Database Setup

### Prerequisites
1. PostgreSQL 12+ installed and running
2. Redis server installed and running
3. Node.js 18+ and npm 9+

### Setup Steps
```bash
cd api
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run migrate
npm run seed
npm run dev
```

### Database Commands
```bash
npm run migrate          # Run latest migrations
npm run migrate:rollback # Rollback last migration
npm run seed             # Insert seed data (admin user)
```

### Database Architecture
8 tables implementing complete PDS data model:
- `users` - User accounts with JWT authentication
- `pds` - Main PDS records with all personal information
- `pds_spouse` - Spouse information (one-to-one)
- `pds_children` - Children records (one-to-many)
- `pds_education` - Educational background (one-to-many)
- `pds_work_experience` - Work history (one-to-many)
- `pds_civil_service` - Civil service eligibilities (one-to-many)
- `pds_references` - Character references (one-to-many)

## API Endpoints

### Authentication (`/api/auth/*`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### PDS Management (`/api/pds/*`) - All Protected
- `GET /api/pds` - List user's PDS records
- `POST /api/pds` - Create new PDS record
- `GET /api/pds/:id` - Get specific PDS record
- `PUT /api/pds/:id` - Update PDS record
- `DELETE /api/pds/:id` - Delete PDS record
- `POST /api/pds/:id/validate` - Validate PDS data

### Export (`/api/export/*`) - All Protected
- `GET /api/export/pds/:id/excel` - Export to Excel
- `GET /api/export/pds/:id/word` - Export to Word
- `GET /api/export/pds/:id/pdf` - Export to PDF

### System
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness probe (checks DB & Redis)
- `GET /api/health/live` - Liveness probe
- `GET /api-docs` - Swagger documentation

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Authentication secret

### Optional
- `API_PORT` - API server port (default: 3001)
- `NODE_ENV` - Environment (development/test/production)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `RATE_LIMIT_WINDOW` - Rate limiting window in minutes (default: 15)
- `RATE_LIMIT_MAX` - Max requests per window (default: 100)
- `UPLOAD_PATH` - File upload directory (default: ./uploads)
- `MAX_FILE_SIZE` - Max upload size (default: 10MB)

The API validates required environment variables on startup via `validateEnvironment()`.

## Core Domain Logic

### PDS Validation Engine (`api/src/services/pdsValidation.ts`)
- Implements CSC Form No. 212 (Revised 2017) requirements
- Validates date formats (MM/DD/YYYY)
- Detects abbreviations in names and institutions
- Returns structured errors with correction suggestions
- Field-specific validation rules for each PDS section

### File Processing
- **Import** (`api/src/services/fileImport.ts`): Extracts PDS data from Excel, Word, PDF
- **Export** (`api/src/services/fileExport.ts`): Generates compliant PDS documents
- **Auto-fix** (`api/src/services/pdsAutoFix.ts`): Automatically corrects common formatting errors

## Testing

### Running Tests
```bash
cd api
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Test Infrastructure
- Jest with TypeScript support via ts-jest
- Supertest for API endpoint testing
- Separate test database (pds_maker_test)
- Coverage reports in HTML and LCOV formats

## Development Workflow

### Adding New Features
1. **Database changes**: Create migration in `api/src/database/migrations/`
2. **Models**: Update TypeScript interfaces in `api/src/models/`
3. **Repositories**: Add data access methods
4. **Services**: Implement business logic
5. **Controllers**: Add request handlers
6. **Routes**: Define endpoints with validation
7. **Tests**: Write tests alongside implementation

### Code Style
- TypeScript with strict configuration
- ESLint + Prettier for formatting
- Conventional commits format
- Path-based imports using aliases

## Security Features

- JWT-based authentication with 24-hour expiration
- bcrypt password hashing
- Input validation with Joi on all endpoints
- Rate limiting with configurable windows
- CORS protection
- SQL injection protection via Knex parameterized queries
- File upload restrictions (type and size)

## Repository Pattern

The API uses a repository pattern for data access:
- `UserRepository` - User CRUD operations
- `PDSRepository` - PDS CRUD operations

Benefits:
- Database abstraction for easier testing
- Consistent error handling
- Type safety with TypeScript
- Transaction support