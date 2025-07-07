describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h1').should('contain', 'Login');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
    cy.get('a').should('contain', 'Register');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.error-message').should('contain', 'Email is required');
    cy.get('.error-message').should('contain', 'Password is required');
  });

  it('should show error for invalid email format', () => {
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.get('.error-message').should('contain', 'Invalid email format');
  });

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid email or password',
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('.error-message').should('contain', 'Invalid email or password');
  });

  it('should login successfully with valid credentials', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
    };

    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        message: 'Login successful',
        user: mockUser,
        token: 'mock-jwt-token',
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('contain', 'Test User');
    
    // Should store token in localStorage
    cy.window().then((window) => {
      expect(window.localStorage.getItem('token')).to.equal('mock-jwt-token');
    });
  });

  it('should show error for deactivated account', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Account is deactivated',
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('deactivated@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('.error-message').should('contain', 'Account is deactivated');
  });

  it('should redirect to dashboard if already logged in', () => {
    // Set token in localStorage
    cy.window().then((window) => {
      window.localStorage.setItem('token', 'valid-jwt-token');
    });

    cy.intercept('GET', '**/api/auth/profile', {
      statusCode: 200,
      body: {
        user: {
          id: '123',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
        },
      },
    }).as('profileRequest');

    cy.visit('/login');
    
    // Should automatically redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to register page', () => {
    cy.get('a').contains('Register').click();
    cy.url().should('include', '/register');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('POST', '**/api/auth/login', {
      forceNetworkError: true,
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.get('.error-message').should('contain', 'Network error');
  });

  it('should disable submit button while loading', () => {
    cy.intercept('POST', '**/api/auth/login', {
      delay: 2000,
      statusCode: 200,
      body: {
        message: 'Login successful',
        user: {},
        token: 'token',
      },
    }).as('loginRequest');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Button should be disabled and show loading state
    cy.get('button[type="submit"]').should('be.disabled');
    cy.get('button[type="submit"]').should('contain', 'Logging in...');
  });
});