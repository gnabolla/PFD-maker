// ***********************************************
// This file contains custom commands for Cypress.
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').contains('Login').click();
  
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard');
  cy.get('[data-testid="user-menu"]').should('be.visible');
});

Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  cy.get('input[name="confirmPassword"]').type(userData.password);
  cy.get('input[name="firstName"]').type(userData.firstName);
  cy.get('input[name="lastName"]').type(userData.lastName);
  cy.get('button[type="submit"]').contains('Register').click();
  
  // Wait for redirect to dashboard
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('createPDS', (pdsData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/pds`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
    body: {
      pdsData: pdsData,
    },
  }).then((response) => {
    expect(response.status).to.equal(201);
    return response.body.pds;
  });
});

Cypress.Commands.add('fillPDSForm', (pdsData) => {
  // Personal Information
  if (pdsData.personalInformation) {
    const pi = pdsData.personalInformation;
    if (pi.surname) cy.get('input[name="personalInformation.surname"]').clear().type(pi.surname);
    if (pi.firstName) cy.get('input[name="personalInformation.firstName"]').clear().type(pi.firstName);
    if (pi.middleName) cy.get('input[name="personalInformation.middleName"]').clear().type(pi.middleName);
    if (pi.dateOfBirth) cy.get('input[name="personalInformation.dateOfBirth"]').clear().type(pi.dateOfBirth);
    if (pi.placeOfBirth) cy.get('input[name="personalInformation.placeOfBirth"]').clear().type(pi.placeOfBirth);
    if (pi.sex) cy.get('select[name="personalInformation.sex"]').select(pi.sex);
    if (pi.civilStatus) cy.get('select[name="personalInformation.civilStatus"]').select(pi.civilStatus);
    if (pi.citizenship) cy.get('input[name="personalInformation.citizenship"]').clear().type(pi.citizenship);
    if (pi.height) cy.get('input[name="personalInformation.height"]').clear().type(pi.height.toString());
    if (pi.weight) cy.get('input[name="personalInformation.weight"]').clear().type(pi.weight.toString());
    if (pi.bloodType) cy.get('input[name="personalInformation.bloodType"]').clear().type(pi.bloodType);
  }
  
  // Address Information
  if (pdsData.personalInformation?.residentialAddress) {
    const ra = pdsData.personalInformation.residentialAddress;
    if (ra.houseBlockLotNumber) cy.get('input[name="personalInformation.residentialAddress.houseBlockLotNumber"]').clear().type(ra.houseBlockLotNumber);
    if (ra.street) cy.get('input[name="personalInformation.residentialAddress.street"]').clear().type(ra.street);
    if (ra.subdivision) cy.get('input[name="personalInformation.residentialAddress.subdivision"]').clear().type(ra.subdivision);
    if (ra.barangay) cy.get('input[name="personalInformation.residentialAddress.barangay"]').clear().type(ra.barangay);
    if (ra.cityMunicipality) cy.get('input[name="personalInformation.residentialAddress.cityMunicipality"]').clear().type(ra.cityMunicipality);
    if (ra.province) cy.get('input[name="personalInformation.residentialAddress.province"]').clear().type(ra.province);
    if (ra.zipCode) cy.get('input[name="personalInformation.residentialAddress.zipCode"]').clear().type(ra.zipCode);
  }
  
  // Contact Information
  if (pdsData.personalInformation) {
    const pi = pdsData.personalInformation;
    if (pi.telephoneNumber) cy.get('input[name="personalInformation.telephoneNumber"]').clear().type(pi.telephoneNumber);
    if (pi.mobileNumber) cy.get('input[name="personalInformation.mobileNumber"]').clear().type(pi.mobileNumber);
    if (pi.emailAddress) cy.get('input[name="personalInformation.emailAddress"]').clear().type(pi.emailAddress);
  }
});

// Prevent TypeScript errors
export {};