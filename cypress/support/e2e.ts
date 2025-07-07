// ***********************************************************
// This file is processed and loaded automatically before test files.
//
// You can change the location of this file or turn off loading
// the support file with the 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<Element>;
      
      /**
       * Custom command to register a new user
       * @example cy.register({ email: 'user@example.com', password: 'password123', firstName: 'John', lastName: 'Doe' })
       */
      register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
      }): Chainable<Element>;
      
      /**
       * Custom command to create a PDS
       * @example cy.createPDS(pdsData)
       */
      createPDS(pdsData: any): Chainable<Element>;
      
      /**
       * Custom command to fill PDS form
       * @example cy.fillPDSForm(pdsData)
       */
      fillPDSForm(pdsData: any): Chainable<Element>;
    }
  }
}