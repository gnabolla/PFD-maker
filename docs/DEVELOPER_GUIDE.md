# Developer Guide

Welcome to the PDS Maker developer guide. This comprehensive guide will help you understand the project architecture, set up your development environment, and contribute effectively to the project.

## Table of Contents

1. [Project Architecture Overview](#project-architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [API Architecture](#api-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Database Design](#database-design)
7. [Adding New Features](#adding-new-features)
8. [Testing Guidelines](#testing-guidelines)
9. [Code Style and Standards](#code-style-and-standards)
10. [Git Workflow](#git-workflow)
11. [Debugging Tips](#debugging-tips)
12. [Performance Optimization](#performance-optimization)

## Project Architecture Overview

PDS Maker is built as an API-first monorepo application with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
├──────────────┬──────────────┬──────────────────────────┤
│  Web App     │  Mobile SDK  │  Third-party Integrations│
│  (React)     │  (React Native/Flutter)                  │
└──────────────┴──────────────┴──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      API Gateway                         │
│                   (Express.js + JWT)                     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Business Logic Layer                  │
├──────────────┬──────────────┬──────────────────────────┤
│  Validation  │  File Import │  Auto-Fix Engine         │
│  Service     │  Export      │                          │
└──────────────┴──────────────┴──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Access Layer                     │
├──────────────────────┬──────────────────────────────────┤
│   PostgreSQL         │        Redis                     │
│   (Primary DB)       │       (Cache)                    │
└──────────────────────┴──────────────────────────────────┘
```

### Key Design Principles

1. **API-First Design**: All functionality exposed through RESTful APIs
2. **Layered Architecture**: Clear separation between routes, controllers, services, and repositories
3. **Type Safety**: TypeScript throughout the codebase
4. **Domain-Driven Design**: Business logic encapsulated in services
5. **Repository Pattern**: Database abstraction for testability
6. **Dependency Injection**: Loose coupling between components

## Development Environment Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Redis**: v6.0 or higher
- **Git**: v2.30 or higher
- **VS Code** (recommended) or your preferred IDE

### Initial Setup

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/pds-maker.git
cd pds-maker
```

2. **Install Dependencies**
```bash
# Install all dependencies (root, API, and web)
npm install

# Or install for specific workspace
npm install --workspace=api
npm install --workspace=web
```

3. **Database Setup**
```bash
# Create PostgreSQL databases
createdb pds_maker_dev
createdb pds_maker_test

# Navigate to API directory
cd api

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Minimum required variables:
# DATABASE_URL=postgresql://username:password@localhost:5432/pds_maker_dev
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. **Run Database Migrations**
```bash
# From api directory
npm run migrate

# Seed initial data (creates admin user)
npm run seed
```

5. **Start Development Servers**
```bash
# From root directory - starts both API and web
npm run dev

# Or start individually
cd api && npm run dev  # API on http://localhost:3001
cd web && npm run dev  # Web on http://localhost:3000
```

6. **Verify Installation**
- API Health Check: http://localhost:3001/api/health
- API Documentation: http://localhost:3001/api-docs
- Web Application: http://localhost:3000

### VS Code Configuration

Recommended extensions:
- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features
- PostgreSQL
- Thunder Client (API testing)
- GitLens

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Project Structure

### Root Directory Structure
```
pds-maker/
├── api/                    # Backend API service
├── web/                    # React web application
├── mobile-sdk/            # Mobile SDKs (future)
├── docs/                  # Documentation
├── examples/              # Integration examples
├── tests/                 # E2E tests
├── deployment/            # Deployment configurations
├── .github/               # GitHub workflows
├── package.json           # Root package.json (workspaces)
├── docker-compose.yml     # Local development setup
└── README.md             # Project overview
```

### API Directory Structure
```
api/
├── src/
│   ├── __tests__/         # Test files
│   ├── controllers/       # Request handlers
│   ├── database/          # DB connection and migrations
│   │   ├── migrations/    # Database migrations
│   │   └── seeds/         # Database seeders
│   ├── middleware/        # Express middleware
│   ├── models/            # TypeScript interfaces
│   ├── repositories/      # Data access layer
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── index.ts          # Application entry point
├── dist/                  # Compiled JavaScript
├── logs/                  # Application logs
├── uploads/               # File upload directory
├── jest.config.js         # Jest configuration
├── knexfile.js           # Database configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # API dependencies
```

### Web Directory Structure
```
web/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable React components
│   │   ├── common/      # Generic components
│   │   ├── forms/       # Form components
│   │   └── layout/      # Layout components
│   ├── pages/           # Page components
│   ├── services/        # API client services
│   ├── store/           # Redux store
│   │   └── slices/      # Redux slices
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Root component
│   └── index.tsx        # Entry point
├── tsconfig.json        # TypeScript configuration
└── package.json         # Web dependencies
```

## API Architecture

### Layered Architecture Pattern

The API follows a strict layered architecture:

1. **Routes Layer** (`/routes`)
   - Define API endpoints
   - Apply middleware
   - Route to controllers
   ```typescript
   router.post('/pds', 
     authenticate, 
     validateRequest(createPDSSchema),
     pdsController.create
   );
   ```

2. **Controller Layer** (`/controllers`)
   - Handle HTTP requests/responses
   - Call service methods
   - Return formatted responses
   ```typescript
   async create(req: Request, res: Response) {
     const pds = await pdsService.create(req.user.id, req.body);
     res.status(201).json(pds);
   }
   ```

3. **Service Layer** (`/services`)
   - Implement business logic
   - Coordinate between repositories
   - Handle transactions
   ```typescript
   async create(userId: string, data: PDSData) {
     const validated = await validationService.validate(data);
     return await pdsRepository.create(userId, validated);
   }
   ```

4. **Repository Layer** (`/repositories`)
   - Database operations only
   - Query building
   - Data mapping
   ```typescript
   async create(userId: string, data: PDSData) {
     const [pds] = await db('pds').insert({
       user_id: userId,
       ...data
     }).returning('*');
     return pds;
   }
   ```

### Middleware Stack

The API uses several middleware in order:

1. **Request Logger** - Logs all incoming requests
2. **CORS** - Handles cross-origin requests
3. **Body Parser** - Parses JSON request bodies
4. **Rate Limiter** - Prevents abuse
5. **Authentication** - Verifies JWT tokens
6. **Validation** - Validates request data
7. **Error Handler** - Catches and formats errors

### Database Connection Management

Database connections are managed through Knex.js:

```typescript
// database/connection.ts
import knex from 'knex';
import knexConfig from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

export default db;
```

### Authentication Flow

JWT-based authentication:

1. User registers/logs in
2. Server generates JWT with user payload
3. Client stores token
4. Client sends token in Authorization header
5. Middleware verifies token
6. User object attached to request

## Frontend Architecture

### React Component Structure

Components are organized by feature and complexity:

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Forms**: Form-specific components
- **Layout**: Layout wrapper components

### State Management

Redux Toolkit for global state:

```typescript
// store/slices/authSlice.ts
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    }
  }
});
```

### API Client

Centralized API client service:

```typescript
// services/api.ts
class APIClient {
  private baseURL: string;
  private token: string | null;

  async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    
    return response.json();
  }
}
```

## Database Design

### Schema Overview

The database is designed to store PDS data in a normalized structure:

```sql
-- Core Tables
users                 -- User accounts
pds                  -- Main PDS records
pds_spouse           -- Spouse information
pds_children         -- Children records
pds_education        -- Educational background
pds_work_experience  -- Work history
pds_civil_service    -- Eligibilities
pds_references       -- Character references
```

### Key Design Decisions

1. **UUID Primary Keys**: For better distribution and security
2. **Soft Deletes**: Preserve data integrity
3. **JSON Fields**: For flexible data storage
4. **Indexes**: On frequently queried fields
5. **Foreign Keys**: With CASCADE for referential integrity

### Migration Best Practices

When creating new migrations:

1. **Naming Convention**: `XXX_action_description.ts`
2. **Atomic Changes**: One logical change per migration
3. **Reversible**: Always include `down` method
4. **Test Thoroughly**: Run up and down migrations

Example migration:
```typescript
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('table_name', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('table_name');
}
```

## Adding New Features

### Feature Development Workflow

1. **Plan the Feature**
   - Define requirements
   - Design API endpoints
   - Plan database changes

2. **Database Layer** (if needed)
   ```bash
   # Create migration
   cd api
   npm run migrate:make add_feature_table
   
   # Edit migration file
   # Run migration
   npm run migrate
   ```

3. **Create Model Interface**
   ```typescript
   // models/feature.ts
   export interface Feature {
     id: string;
     name: string;
     // ... other fields
   }
   ```

4. **Implement Repository**
   ```typescript
   // repositories/FeatureRepository.ts
   export class FeatureRepository {
     async create(data: Feature): Promise<Feature> {
       const [feature] = await db('features')
         .insert(data)
         .returning('*');
       return feature;
     }
   }
   ```

5. **Create Service**
   ```typescript
   // services/featureService.ts
   export class FeatureService {
     constructor(
       private featureRepo: FeatureRepository
     ) {}
     
     async create(data: CreateFeatureDto): Promise<Feature> {
       // Business logic here
       return this.featureRepo.create(data);
     }
   }
   ```

6. **Add Controller**
   ```typescript
   // controllers/featureController.ts
   export const featureController = {
     async create(req: Request, res: Response) {
       const feature = await featureService.create(req.body);
       res.status(201).json(feature);
     }
   };
   ```

7. **Define Routes**
   ```typescript
   // routes/feature.ts
   router.post('/features',
     authenticate,
     validateRequest(createFeatureSchema),
     featureController.create
   );
   ```

8. **Add Validation**
   ```typescript
   // middleware/validation.ts
   export const createFeatureSchema = Joi.object({
     name: Joi.string().required(),
     // ... other validations
   });
   ```

9. **Write Tests**
   ```typescript
   // __tests__/feature.test.ts
   describe('Feature API', () => {
     it('should create a feature', async () => {
       const response = await request(app)
         .post('/api/features')
         .set('Authorization', `Bearer ${token}`)
         .send({ name: 'Test Feature' });
       
       expect(response.status).toBe(201);
       expect(response.body.name).toBe('Test Feature');
     });
   });
   ```

10. **Update Documentation**
    - Add API endpoint to Swagger docs
    - Update README if needed
    - Add to API integration guide

### Common Feature Patterns

#### Adding a New PDS Section

1. Update PDS model interface
2. Create migration for new table
3. Add repository methods
4. Update validation service
5. Extend export/import services
6. Add frontend form component

#### Adding File Processing

1. Configure multer middleware
2. Add file validation
3. Implement processing service
4. Store file references in database
5. Add cleanup jobs

#### Adding Notifications

1. Choose notification service (email/SMS)
2. Create notification templates
3. Implement notification service
4. Add queue for async processing
5. Create notification preferences

## Testing Guidelines

### Test Structure

```
__tests__/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Writing Tests

#### Unit Tests
Test individual functions/methods:

```typescript
describe('PDSValidationService', () => {
  describe('validateDate', () => {
    it('should accept MM/DD/YYYY format', () => {
      const result = validateDate('01/15/2024');
      expect(result.isValid).toBe(true);
    });
    
    it('should reject invalid format', () => {
      const result = validateDate('15/01/2024');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('MM/DD/YYYY');
    });
  });
});
```

#### Integration Tests
Test API endpoints:

```typescript
describe('POST /api/pds', () => {
  let token: string;
  
  beforeAll(async () => {
    token = await getAuthToken();
  });
  
  it('should create PDS with valid data', async () => {
    const response = await request(app)
      .post('/api/pds')
      .set('Authorization', `Bearer ${token}`)
      .send(validPDSData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

#### E2E Tests
Test complete user flows:

```typescript
describe('PDS Creation Flow', () => {
  it('should complete PDS creation', async () => {
    // 1. Register user
    // 2. Login
    // 3. Create PDS
    // 4. Validate
    // 5. Export
  });
});
```

### Test Best Practices

1. **Descriptive Names**: Test names should explain what they test
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Test Data**: Use factories for test data
4. **Isolation**: Tests should not depend on each other
5. **Clean Up**: Always clean up test data
6. **Mock External Services**: Don't call real APIs in tests

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="validation"
```

## Code Style and Standards

### TypeScript Guidelines

1. **Strict Mode**: Always use strict TypeScript
2. **Type Everything**: Avoid `any` type
3. **Interfaces over Types**: For object shapes
4. **Enums**: For fixed sets of values
5. **Optional vs Undefined**: Be explicit

```typescript
// Good
interface User {
  id: string;
  email: string;
  firstName: string;
  middleName?: string; // Optional
}

// Bad
interface User {
  id: any;
  email: string;
  firstName: string;
  middleName: string | undefined;
}
```

### Naming Conventions

- **Files**: `camelCase.ts` or `PascalCase.tsx` for components
- **Classes**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` with `I` prefix optional

### Code Organization

1. **Imports Order**:
   - External packages
   - Internal absolute imports
   - Relative imports
   - Type imports

2. **File Structure**:
   - Imports
   - Types/Interfaces
   - Constants
   - Main code
   - Exports

### ESLint Rules

Key rules enforced:
- No unused variables
- No console.log in production
- Consistent return types
- No implicit any
- Prefer const

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance tasks
- `docs/description` - Documentation updates

### Commit Messages

Follow Conventional Commits:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

Examples:
```bash
feat(api): add PDS export endpoint
fix(validation): correct date format validation
docs(api): update swagger documentation
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update docs

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push Branch**
   ```bash
   git push origin feature/new-feature
   ```

5. **Create PR**
   - Use PR template
   - Link related issues
   - Add reviewers

6. **Code Review**
   - Address feedback
   - Update as needed

7. **Merge**
   - Squash and merge
   - Delete branch

### Code Review Checklist

- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance considered
- [ ] Error handling complete

## Debugging Tips

### API Debugging

1. **Enable Debug Logs**
   ```bash
   DEBUG=pds:* npm run dev
   ```

2. **Use VS Code Debugger**
   ```json
   // .vscode/launch.json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug API",
     "skipFiles": ["<node_internals>/**"],
     "program": "${workspaceFolder}/api/src/index.ts",
     "preLaunchTask": "tsc: build - api/tsconfig.json",
     "outFiles": ["${workspaceFolder}/api/dist/**/*.js"]
   }
   ```

3. **Database Queries**
   ```typescript
   // Enable query logging
   const db = knex({
     ...config,
     debug: true
   });
   ```

4. **Request Inspection**
   - Use Thunder Client or Postman
   - Check request/response headers
   - Verify JWT payload

### Frontend Debugging

1. **React Developer Tools**
   - Inspect component props
   - View component state
   - Track re-renders

2. **Redux DevTools**
   - View action history
   - Time-travel debugging
   - State inspection

3. **Network Tab**
   - Check API calls
   - Verify request payload
   - Inspect response data

### Common Issues

#### Issue: "Cannot connect to database"
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
psql $DATABASE_URL

# Check migrations
npm run migrate:status
```

#### Issue: "JWT token invalid"
```bash
# Decode token
echo $TOKEN | cut -d. -f2 | base64 -d

# Check expiration
# Verify secret matches
```

#### Issue: "CORS error"
```typescript
// Check CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true
}));
```

## Performance Optimization

### Database Optimization

1. **Indexing**
   ```sql
   CREATE INDEX idx_pds_user_id ON pds(user_id);
   CREATE INDEX idx_pds_status ON pds(status);
   ```

2. **Query Optimization**
   ```typescript
   // Bad - N+1 query
   const users = await db('users').select();
   for (const user of users) {
     user.pds = await db('pds').where({ user_id: user.id });
   }
   
   // Good - Join
   const users = await db('users')
     .leftJoin('pds', 'users.id', 'pds.user_id')
     .select();
   ```

3. **Connection Pooling**
   ```typescript
   const db = knex({
     client: 'pg',
     connection: DATABASE_URL,
     pool: {
       min: 2,
       max: 10,
       idleTimeoutMillis: 30000
     }
   });
   ```

### API Optimization

1. **Response Caching**
   ```typescript
   // Redis caching
   const cached = await redis.get(cacheKey);
   if (cached) {
     return JSON.parse(cached);
   }
   ```

2. **Pagination**
   ```typescript
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;
   const offset = (page - 1) * limit;
   
   const results = await db('pds')
     .limit(limit)
     .offset(offset);
   ```

3. **Field Selection**
   ```typescript
   // Only select needed fields
   const pds = await db('pds')
     .select('id', 'status', 'personal_information')
     .where({ user_id });
   ```

### Frontend Optimization

1. **Code Splitting**
   ```typescript
   const PDSForm = lazy(() => import('./pages/PDSForm'));
   ```

2. **Memoization**
   ```typescript
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(data);
   }, [data]);
   ```

3. **Debouncing**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce(handleSearch, 300),
     []
   );
   ```

## Deployment Considerations

### Environment Variables

Required for production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database
- `REDIS_URL` - Production Redis
- `JWT_SECRET` - Strong secret key
- `CORS_ORIGIN` - Allowed origins

### Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set secure headers
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Sanitize outputs
- [ ] Use prepared statements
- [ ] Keep dependencies updated

### Monitoring

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring

2. **Log Management**
   - Centralized logging
   - Log rotation
   - Error alerting

3. **Database Monitoring**
   - Query performance
   - Connection pool stats
   - Slow query logs

## Getting Help

### Resources

- Project Documentation: `/docs`
- API Documentation: http://localhost:3001/api-docs
- TypeScript Docs: https://www.typescriptlang.org/docs/
- Knex.js Docs: http://knexjs.org/
- React Docs: https://reactjs.org/docs/

### Community

- GitHub Issues: Report bugs and request features
- Discord: Join developer discussions
- Stack Overflow: Tag questions with `pds-maker`

### Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

Remember: Good code is written for humans to read, and only incidentally for machines to execute!