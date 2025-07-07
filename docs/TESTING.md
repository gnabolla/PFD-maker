# PDS-Maker Testing Infrastructure

This document describes the comprehensive testing infrastructure set up for the PDS-Maker project.

## Overview

The testing infrastructure includes:
- Unit tests for validation and auto-fix services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test data generators for consistent testing

## Test Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing for the web app
- **Cypress**: End-to-end testing
- **Supertest**: API endpoint testing
- **Faker.js**: Test data generation

## Running Tests

### Unit Tests

```bash
# Run all API tests
cd api && npm test

# Run with coverage
cd api && npm run test:coverage

# Run in watch mode
cd api && npm run test:watch

# Run specific test file
cd api && npm test -- pdsValidation.test.ts
```

### Web Tests

```bash
# Run all web tests
cd web && npm test

# Run with coverage
cd web && npm test -- --coverage

# Run in watch mode
cd web && npm test -- --watch
```

### E2E Tests

```bash
# Open Cypress Test Runner
npm run test:e2e

# Run headless
npm run test:e2e:headless

# Run specific test
npm run test:e2e:headless -- --spec "cypress/e2e/auth/login.cy.ts"
```

## Test Structure

### API Tests (`/api/src/__tests__/`)

```
__tests__/
├── services/
│   ├── pdsValidation.test.ts    # Validation service tests
│   └── pdsAutoFix.test.ts       # Auto-fix service tests
├── factories/
│   ├── userFactory.ts           # User data generator
│   └── pdsFactory.ts            # PDS data generator
├── utils/
│   └── testHelpers.ts           # Test utilities
├── auth.test.ts                 # Authentication endpoint tests
├── pds.test.ts                  # PDS CRUD endpoint tests
├── export.test.ts               # Export endpoint tests
└── setup.ts                     # Test setup
```

### E2E Tests (`/cypress/e2e/`)

```
e2e/
├── auth/
│   └── login.cy.ts              # Login flow tests
└── pds/
    └── pds-form.cy.ts           # PDS form submission tests
```

## Test Data Generators

### User Factory

```typescript
import { UserFactory } from '@/__tests__/factories/userFactory';

// Create a single user
const user = await UserFactory.create();

// Create admin user
const admin = await UserFactory.createAdmin();

// Create multiple users
const users = await UserFactory.createMany(5);

// Create with overrides
const customUser = await UserFactory.create({
  email: 'custom@example.com',
  role: 'admin'
});
```

### PDS Factory

```typescript
import { PDSFactory } from '@/__tests__/factories/pdsFactory';

// Create valid PDS
const validPDS = PDSFactory.createValid();

// Create with invalid dates
const invalidDatesPDS = PDSFactory.createWithInvalidDates();

// Create with abbreviations
const abbreviationsPDS = PDSFactory.createWithAbbreviations();

// Create minimal PDS (only required fields)
const minimalPDS = PDSFactory.createMinimal();

// Create work experience
const workExp = PDSFactory.createWorkExperience(3);
```

## Test Coverage

### Current Coverage Goals

- **Overall**: 70%+ coverage
- **Services**: 90%+ coverage
- **Controllers**: 80%+ coverage
- **Critical Paths**: 100% coverage

### Checking Coverage

```bash
# API coverage
cd api && npm run test:coverage

# Web coverage
cd web && npm test -- --coverage --watchAll=false
```

## Writing Tests

### Unit Test Example

```typescript
describe('PDSValidationService', () => {
  describe('validateDateFormat', () => {
    it('should validate correct MM/DD/YYYY format', () => {
      const result = PDSValidationService.validateDateFormat('01/15/2024');
      expect(result).toBe(true);
    });

    it('should reject invalid formats', () => {
      const result = PDSValidationService.validateDateFormat('2024-01-15');
      expect(result).toBe(false);
    });
  });
});
```

### Integration Test Example

```typescript
describe('POST /api/pds', () => {
  it('should create new PDS', async () => {
    const pdsData = PDSFactory.createValid();
    
    const response = await request(app)
      .post('/api/pds')
      .set('Authorization', `Bearer ${token}`)
      .send({ pdsData });

    expect(response.status).toBe(201);
    expect(response.body.pds).toBeDefined();
  });
});
```

### E2E Test Example

```typescript
describe('Login Flow', () => {
  it('should login with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
  });
});
```

## Mocking

### Mocking Repositories

```typescript
jest.mock('../repositories/UserRepository');
const mockUserRepository = UserRepository as jest.MockedClass<typeof UserRepository>;

// In test
userRepositoryInstance.findByEmail.mockResolvedValue(mockUser);
```

### Mocking API Responses (Cypress)

```typescript
cy.intercept('POST', '**/api/auth/login', {
  statusCode: 200,
  body: {
    user: mockUser,
    token: 'mock-token'
  }
}).as('loginRequest');
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
          
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run unit tests
        run: npm test
        
      - name: Run E2E tests
        run: npm run test:e2e:headless
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Use Factories**: Generate test data consistently
3. **Mock External Dependencies**: Database, APIs, etc.
4. **Test Critical Paths**: Authentication, PDS submission, validation
5. **Descriptive Test Names**: Clear what is being tested
6. **Arrange-Act-Assert**: Structure tests clearly
7. **Clean Up**: Remove test data after tests

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure test database is created
   - Check DATABASE_URL in .env.test

2. **Cypress Not Opening**
   - Run `npx cypress verify`
   - Check if DISPLAY is set for Linux

3. **Mock Not Working**
   - Clear Jest cache: `jest --clearCache`
   - Check mock path matches actual import

4. **Flaky E2E Tests**
   - Add proper waits: `cy.wait('@apiCall')`
   - Use data-testid attributes
   - Increase timeout for slow operations

## Future Improvements

1. **Visual Regression Testing**: Add Percy or similar
2. **Performance Testing**: Add lighthouse CI
3. **Load Testing**: Add k6 or Artillery
4. **Mutation Testing**: Add Stryker
5. **Contract Testing**: Add Pact for API contracts