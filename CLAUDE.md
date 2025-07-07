# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDS Maker is an open source platform for creating, validating, and processing Philippine Civil Service Commission (CSC) Personal Data Sheets (PDS) with automatic formatting correction. The platform solves the critical problem of formatting errors that cause repeated PDS rejections in Philippine government agencies.

## Implementation Status ✅

**The API is now fully functional and production-ready!** All core features have been implemented:

- ✅ **Database Schema**: Complete PostgreSQL schema with 8 tables for users and PDS data
- ✅ **Authentication System**: JWT-based auth with user registration, login, and profile management
- ✅ **PDS Management**: Full CRUD operations for Personal Data Sheets with user ownership
- ✅ **File Export**: Excel, Word, and PDF export capabilities integrated
- ✅ **Input Validation**: Comprehensive Joi validation for all endpoints
- ✅ **Testing Infrastructure**: Jest configuration with sample tests
- ✅ **Security**: Protected routes, password hashing, and role-based access control

## Architecture

This is an **API-first monorepo** with the following structure:
- `api/` - Express.js backend with TypeScript (IMPLEMENTED)
- `web/` - React.js frontend (to be implemented)
- `mobile-sdk/` - React Native/Flutter SDKs (to be implemented)
- `docs/`, `examples/`, `tests/`, `deployment/` - Supporting directories

The backend follows a **layered architecture**:
- **Routes** (`api/src/routes/`) - API endpoints with OpenAPI/Swagger documentation
- **Controllers** (`api/src/controllers/`) - Request handling logic with authentication
- **Services** (`api/src/services/`) - Business logic including PDS validation and file processing
- **Repositories** (`api/src/repositories/`) - Data access layer with Knex ORM
- **Models** (`api/src/models/`) - TypeScript interfaces for PDS data structures
- **Middleware** (`api/src/middleware/`) - Authentication, validation, error handling, request logging
- **Database** (`api/src/database/`) - PostgreSQL (Knex) and Redis connections

## Core PDS Domain Logic

The system implements **CSC Form No. 212 (Revised 2017)** requirements:

### PDS Data Model (`api/src/models/pds.ts`)
- Complete TypeScript interfaces for all PDS sections
- Strict formatting requirements (e.g., MM/DD/YYYY dates, FULL names without abbreviations)
- Validation error types with suggestions for corrections

### Validation Engine (`api/src/services/pdsValidation.ts`)
- `PDSValidationService.validatePDS()` - Comprehensive validation against CSC requirements
- Field-specific validations for dates, names, addresses, work experience, etc.
- Returns structured errors with field paths, error codes, and correction suggestions

### File Processing (`api/src/services/fileImport.ts`, `api/src/services/fileExport.ts`)
- **Import**: Extracts PDS data from Excel (.xlsx), Word (.docx), and PDF files
- **Export**: Generates compliant PDS documents in Excel, Word, and PDF formats using ExcelJS, DOCX, and Puppeteer
- Handles date format conversion and data structure mapping

## Database Architecture

The system uses **PostgreSQL** with **Knex.js** for migrations and query building:

### Database Tables (8 tables implemented):
1. **`users`** - User accounts with authentication
2. **`pds`** - Main PDS records with personal information
3. **`pds_spouse`** - Spouse information (optional)
4. **`pds_children`** - Children information (array)
5. **`pds_education`** - Educational background records
6. **`pds_work_experience`** - Work experience records
7. **`pds_civil_service`** - Civil service eligibility records
8. **`pds_references`** - Character references

### Key Features:
- **UUID Primary Keys** for all tables
- **Foreign Key Constraints** with CASCADE deletes
- **JSON Storage** for complete PDS data in `pds.full_data`
- **Indexed Fields** for performance (user_id, status, dates)
- **Data Validation** at database and application level

## Authentication System

### JWT-Based Authentication:
- **Registration**: `/api/auth/register` - Create new user accounts
- **Login**: `/api/auth/login` - Authenticate and receive JWT token
- **Profile Management**: `/api/auth/profile` - Get/update user profile
- **Password Change**: `/api/auth/change-password` - Secure password updates

### Security Features:
- **bcrypt** password hashing with salt rounds
- **JWT tokens** with 24-hour expiration
- **Role-based access control** (user, admin)
- **Protected routes** with middleware authentication
- **Input validation** on all endpoints

## Repository Pattern

### Data Access Layer:
- **`UserRepository`** (`api/src/repositories/UserRepository.ts`):
  - User CRUD operations, email lookup, password management
- **`PDSRepository`** (`api/src/repositories/PDSRepository.ts`):
  - PDS CRUD operations, user ownership checks, status management

### Benefits:
- **Database abstraction** for easier testing and maintenance
- **Consistent error handling** across all database operations
- **Type safety** with TypeScript interfaces
- **Query optimization** with proper indexing

## Development Commands

### Root Level
```bash
npm install              # Install all dependencies (API + Web)
npm run dev             # Start both API and web development servers
npm run build           # Build both API and web for production
npm test                # Run all test suites
npm run lint            # Lint all TypeScript/JavaScript files
npm run lint:fix        # Fix linting issues automatically
npm run docker:build    # Build Docker image
npm run docker:run      # Run with Docker Compose
```

### API Development (`cd api/`)
```bash
npm run dev             # Start API with nodemon (auto-reload)
npm run build           # Compile TypeScript to dist/
npm start               # Run compiled JavaScript from dist/
npm test                # Run Jest test suite
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage report
npm run migrate         # Run database migrations
npm run migrate:rollback # Rollback database migrations
npm run seed            # Run database seeds
npm run docs            # Generate Swagger documentation
```

## Input Validation

### Joi Validation Schemas (`api/src/middleware/validation.ts`):
- **Authentication**: Registration, login, password change validation
- **PDS Data**: Comprehensive validation for all PDS fields
- **Address Validation**: Philippine address format validation
- **Date Formats**: MM/DD/YYYY validation for all date fields
- **Government IDs**: Format validation for GSIS, SSS, TIN, etc.

### Validation Features:
- **Detailed Error Messages** with field-specific guidance
- **Pattern Matching** for dates, IDs, and names
- **Required Field Enforcement** based on CSC requirements
- **Data Sanitization** and type coercion

## API Endpoints

### Authentication Routes (`/api/auth/*`):
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### PDS Routes (`/api/pds/*`) - All Protected:
- `GET /api/pds` - List user's PDS records
- `POST /api/pds` - Create new PDS record
- `GET /api/pds/:id` - Get specific PDS record
- `PUT /api/pds/:id` - Update PDS record
- `DELETE /api/pds/:id` - Delete PDS record
- `POST /api/pds/:id/validate` - Validate PDS data

### Export Routes (`/api/export/*`) - All Protected:
- `GET /api/export/pds/:id/excel` - Export to Excel
- `GET /api/export/pds/:id/word` - Export to Word
- `GET /api/export/pds/:id/pdf` - Export to PDF

### System Routes:
- `GET /api/health` - Health check
- `GET /api-docs` - Swagger documentation

## Testing Infrastructure

### Jest Configuration (`api/jest.config.js`):
- **TypeScript Support** with ts-jest
- **Path Mapping** matching tsconfig.json aliases
- **Coverage Reports** in HTML and LCOV formats
- **Test Environment** configured for Node.js
- **Mock Support** for database and external services

### Test Structure:
- **Unit Tests**: Individual function and method testing
- **Integration Tests**: API endpoint testing with supertest
- **Test Setup**: Global configuration in `api/src/__tests__/setup.ts`
- **Sample Tests**: Authentication flow testing implemented

### Database Setup

**Prerequisites:**
1. PostgreSQL 12+ installed and running
2. Redis server installed and running
3. Node.js 18+ and npm 9+

**Setup Steps:**
1. Copy `.env.example` to `.env` and configure:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/pds_maker_dev
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secure-jwt-secret-key
   ```
2. Install dependencies: `cd api && npm install`
3. Run migrations: `npm run migrate`
4. Seed initial data: `npm run seed`
5. Start development server: `npm run dev`

**Database Commands:**
```bash
npm run migrate         # Run latest migrations
npm run migrate:rollback # Rollback last migration
npm run seed           # Insert seed data (admin user)
```

## Path Aliases

The API uses TypeScript path aliases configured in `api/tsconfig.json`:
- `@/*` maps to `api/src/*`
- `@/controllers/*` maps to `api/src/controllers/*`
- `@/services/*` maps to `api/src/services/*`
- etc.

Always use these aliases when importing files within the API.

## Key Environment Variables

### Required for Development:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `JWT_SECRET` - Authentication secret (use strong random key)
- `NODE_ENV` - Environment (development/test/production)

### Optional Configuration:
- `API_PORT` - API server port (default: 3001)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Individual database config
- `DB_NAME_TEST` - Test database name (default: pds_maker_test)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `RATE_LIMIT_WINDOW` - Rate limiting window in minutes (default: 15)
- `RATE_LIMIT_MAX` - Max requests per window (default: 100)
- `UPLOAD_PATH` - File upload directory (default: ./uploads)
- `MAX_FILE_SIZE` - Max upload size (default: 10MB)

The API validates required environment variables on startup via `validateEnvironment()`.

## API Documentation

- Swagger UI available at `http://localhost:3001/api-docs` when running
- API routes are documented with JSDoc comments for automatic Swagger generation
- Health checks available at `/api/health`, `/api/health/ready`, `/api/health/live`

## File Upload Handling

- Configured with Multer for multipart/form-data
- Supports Excel, Word, PDF file types for PDS import
- Files stored in `uploads/` directory (configurable via `UPLOAD_PATH`)
- 10MB file size limit (configurable via `MAX_FILE_SIZE`)

## Error Handling

- Custom `AppError` class for structured error responses
- Global error handler middleware captures all errors
- Request logging with unique request IDs for tracing
- Winston logger with file rotation for production

## Code Style

- TypeScript with strict configuration
- ESLint + Prettier for code formatting
- Conventional commits format required for pull requests
- Path-based imports using TypeScript aliases

## Development Workflow

### Getting Started:
1. **Environment Setup**: Configure `.env` with database credentials
2. **Database Initialization**: Run migrations and seeds
3. **Development Server**: Start with `npm run dev`
4. **API Testing**: Use Swagger UI at `http://localhost:3001/api-docs`

### Adding New Features:
1. **Database Changes**: Create migrations in `api/src/database/migrations/`
2. **Models**: Update TypeScript interfaces in `api/src/models/`
3. **Repositories**: Add data access methods in `api/src/repositories/`
4. **Controllers**: Implement business logic in `api/src/controllers/`
5. **Routes**: Add endpoints with validation in `api/src/routes/`
6. **Tests**: Write tests in `api/src/__tests__/`

### Testing Commands:
```bash
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

## Next Steps for Frontend Integration

The API is ready for frontend development. Key integration points:

### Authentication Flow:
1. **Register**: `POST /api/auth/register` → Receive JWT token
2. **Login**: `POST /api/auth/login` → Store JWT in localStorage/cookies
3. **API Calls**: Include `Authorization: Bearer <token>` header
4. **Profile**: `GET /api/auth/profile` → Get user information

### PDS Management:
1. **List PDS**: `GET /api/pds` → Show user's PDS records
2. **Create PDS**: `POST /api/pds` → Form submission with validation
3. **Edit PDS**: `PUT /api/pds/:id` → Update existing records
4. **Export PDS**: `GET /api/export/pds/:id/{format}` → Download files

### Error Handling:
- **Validation Errors**: 400 status with detailed field errors
- **Authentication Errors**: 401 status for invalid/missing tokens
- **Authorization Errors**: 403 status for insufficient permissions
- **Not Found Errors**: 404 status for missing resources

## Testing Strategy

- **Jest** for unit and integration tests with TypeScript support
- **Supertest** for API endpoint testing with real HTTP requests
- **Database Mocking** for isolated unit tests
- **Test Coverage** tracking with HTML and LCOV reports
- **Continuous Testing** with watch mode during development

## Implementation Summary

### Completed Tasks ✅

All 10 planned tasks have been successfully implemented:

1. ✅ **Database Configuration**: Created `knexfile.js` with development, test, and production environments
2. ✅ **Database Migrations**: Implemented 8 comprehensive migrations for complete PDS data schema
3. ✅ **Database Seeds**: Created admin user seed with secure password hashing
4. ✅ **Repository Layer**: Built UserRepository and PDSRepository with full CRUD operations
5. ✅ **Authentication System**: Complete JWT-based auth with registration, login, and profile management
6. ✅ **Authentication Middleware**: JWT verification, role-based access, and route protection
7. ✅ **PDS CRUD Operations**: Full PDS management with user ownership and validation
8. ✅ **Export Integration**: Connected Excel, Word, and PDF export routes to FileExportService
9. ✅ **Testing Infrastructure**: Jest configuration with TypeScript support and sample tests
10. ✅ **Input Validation**: Comprehensive Joi validation schemas for all endpoints

### Ready for Production

The API is now **production-ready** with:
- **Secure authentication** and authorization
- **Complete database schema** with proper relationships
- **Comprehensive input validation** and error handling
- **File export capabilities** in multiple formats
- **Testing infrastructure** for ongoing development
- **Documentation** via Swagger UI

### Quick Start

```bash
# Setup
cd api
cp .env.example .env
# Edit .env with your database credentials
npm install

# Database
npm run migrate
npm run seed

# Development
npm run dev
# API available at http://localhost:3001
# Swagger docs at http://localhost:3001/api-docs

# Testing
npm test
npm run test:coverage
```