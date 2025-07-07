describe('PDS Form Submission', () => {
  beforeEach(() => {
    // Login first
    cy.window().then((window) => {
      window.localStorage.setItem('token', 'valid-jwt-token');
    });

    // Mock user profile
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

    // Mock PDS list
    cy.intercept('GET', '**/api/pds', {
      statusCode: 200,
      body: {
        pdsList: [],
      },
    }).as('pdsListRequest');

    cy.visit('/pds/new');
  });

  it('should display PDS form with all sections', () => {
    // Check form sections
    cy.get('h2').should('contain', 'Personal Information');
    cy.get('h2').should('contain', 'Family Background');
    cy.get('h2').should('contain', 'Educational Background');
    cy.get('h2').should('contain', 'Civil Service Eligibility');
    cy.get('h2').should('contain', 'Work Experience');
    cy.get('h2').should('contain', 'Voluntary Work');
    cy.get('h2').should('contain', 'Learning and Development');
    cy.get('h2').should('contain', 'Other Information');
    cy.get('h2').should('contain', 'Questions');
    cy.get('h2').should('contain', 'References');
  });

  it('should validate required fields', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').contains('Save PDS').click();

    // Check validation errors
    cy.get('.error-message').should('contain', 'Surname is required');
    cy.get('.error-message').should('contain', 'First name is required');
    cy.get('.error-message').should('contain', 'Middle name is required');
    cy.get('.error-message').should('contain', 'Date of birth is required');
  });

  it('should validate date format', () => {
    const pdsData = {
      personalInformation: {
        surname: 'DELA CRUZ',
        firstName: 'JUAN',
        middleName: 'SANTOS',
        dateOfBirth: '1990-01-15', // Wrong format
      },
    };

    cy.fillPDSForm(pdsData);
    cy.get('button[type="submit"]').contains('Save PDS').click();

    cy.get('.error-message').should('contain', 'Date must be in MM/DD/YYYY format');
  });

  it('should detect abbreviations in institution names', () => {
    // Fill basic required fields
    const basicData = {
      personalInformation: {
        surname: 'DELA CRUZ',
        firstName: 'JUAN',
        middleName: 'SANTOS',
        dateOfBirth: '01/15/1990',
        placeOfBirth: 'Manila',
        sex: 'Male',
        civilStatus: 'Single',
        citizenship: 'Filipino',
        height: 175,
        weight: 70,
        bloodType: 'O+',
        residentialAddress: {
          barangay: 'Barangay 1',
          cityMunicipality: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
        },
        permanentAddress: {
          barangay: 'Barangay 1',
          cityMunicipality: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
        },
      },
    };

    cy.fillPDSForm(basicData);

    // Add educational background with abbreviation
    cy.get('input[name="educationalBackground.elementary.nameOfSchool"]').type('CSC Elementary School');
    cy.get('button[type="submit"]').contains('Save PDS').click();

    cy.get('.error-message').should('contain', 'should not contain abbreviations');
  });

  it('should successfully submit valid PDS data', () => {
    const validPDSData = {
      personalInformation: {
        surname: 'DELA CRUZ',
        firstName: 'JUAN',
        middleName: 'SANTOS',
        nameExtension: '',
        dateOfBirth: '01/15/1990',
        placeOfBirth: 'Manila',
        sex: 'Male',
        civilStatus: 'Single',
        citizenship: 'Filipino',
        height: '175',
        weight: '70',
        bloodType: 'O+',
        residentialAddress: {
          houseBlockLotNumber: '123',
          street: 'Main Street',
          subdivision: 'Subdivision',
          barangay: 'Barangay 1',
          cityMunicipality: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
        },
        permanentAddress: {
          houseBlockLotNumber: '123',
          street: 'Main Street',
          subdivision: 'Subdivision',
          barangay: 'Barangay 1',
          cityMunicipality: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
        },
        telephoneNumber: '02-1234567',
        mobileNumber: '09171234567',
        emailAddress: 'juan@example.com',
      },
    };

    cy.intercept('POST', '**/api/pds', {
      statusCode: 201,
      body: {
        message: 'PDS created successfully',
        pds: {
          id: 'new-pds-id',
          user_id: '123',
          status: 'draft',
          full_data: validPDSData,
        },
      },
    }).as('createPDS');

    cy.fillPDSForm(validPDSData);
    cy.get('button[type="submit"]').contains('Save PDS').click();

    cy.wait('@createPDS');

    // Should show success message
    cy.get('.success-message').should('contain', 'PDS saved successfully');

    // Should redirect to PDS view page
    cy.url().should('include', '/pds/new-pds-id');
  });

  it('should auto-save draft while filling form', () => {
    cy.intercept('POST', '**/api/pds', {
      statusCode: 201,
      body: {
        message: 'PDS created successfully',
        pds: {
          id: 'draft-pds-id',
          status: 'draft',
        },
      },
    }).as('createDraft');

    cy.intercept('PUT', '**/api/pds/*', {
      statusCode: 200,
      body: {
        message: 'PDS updated successfully',
      },
    }).as('updateDraft');

    // Fill some fields
    cy.get('input[name="personalInformation.surname"]').type('DELA CRUZ');
    cy.get('input[name="personalInformation.firstName"]').type('JUAN');

    // Wait for auto-save (should trigger after 3 seconds of inactivity)
    cy.wait(3500);
    cy.wait('@createDraft');

    // Continue filling
    cy.get('input[name="personalInformation.middleName"]').type('SANTOS');
    
    // Wait for another auto-save
    cy.wait(3500);
    cy.wait('@updateDraft');

    // Check auto-save indicator
    cy.get('[data-testid="auto-save-indicator"]').should('contain', 'Saved');
  });

  it('should handle validation errors from API', () => {
    cy.intercept('POST', '**/api/pds', {
      statusCode: 400,
      body: {
        error: 'Validation failed',
        details: [
          {
            field: 'personalInformation.dateOfBirth',
            message: 'Invalid date format',
          },
        ],
      },
    }).as('createPDS');

    const pdsData = {
      personalInformation: {
        surname: 'DELA CRUZ',
        firstName: 'JUAN',
        middleName: 'SANTOS',
        dateOfBirth: '01/15/1990',
      },
    };

    cy.fillPDSForm(pdsData);
    cy.get('button[type="submit"]').contains('Save PDS').click();

    cy.wait('@createPDS');
    cy.get('.error-message').should('contain', 'Invalid date format');
  });

  it('should allow adding multiple work experiences', () => {
    // Fill basic required fields first
    const basicData = {
      personalInformation: {
        surname: 'DELA CRUZ',
        firstName: 'JUAN',
        middleName: 'SANTOS',
        dateOfBirth: '01/15/1990',
        placeOfBirth: 'Manila',
        sex: 'Male',
        civilStatus: 'Single',
        citizenship: 'Filipino',
        height: '175',
        weight: '70',
        bloodType: 'O+',
        residentialAddress: {
          barangay: 'Barangay 1',
          cityMunicipality: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
        },
        permanentAddress: {
          barangay: 'Barangay 1',
          cityMunicipality: 'Manila',
          province: 'Metro Manila',
          zipCode: '1000',
        },
      },
    };

    cy.fillPDSForm(basicData);

    // Navigate to work experience section
    cy.get('button').contains('Add Work Experience').click();

    // Fill first work experience
    cy.get('input[name="workExperience[0].positionTitle"]').type('Software Developer');
    cy.get('input[name="workExperience[0].departmentAgencyOfficeCompany"]').type('Technology Company');
    cy.get('input[name="workExperience[0].inclusiveDates.from"]').type('01/01/2020');
    cy.get('input[name="workExperience[0].inclusiveDates.to"]').type('Present');
    cy.get('input[name="workExperience[0].monthlySalary"]').type('50000');
    cy.get('select[name="workExperience[0].statusOfAppointment"]').select('Permanent');

    // Add another work experience
    cy.get('button').contains('Add Work Experience').click();

    // Fill second work experience
    cy.get('input[name="workExperience[1].positionTitle"]').type('Junior Developer');
    cy.get('input[name="workExperience[1].departmentAgencyOfficeCompany"]').type('Startup Company');
    cy.get('input[name="workExperience[1].inclusiveDates.from"]').type('06/01/2018');
    cy.get('input[name="workExperience[1].inclusiveDates.to"]').type('12/31/2019');
    cy.get('input[name="workExperience[1].monthlySalary"]').type('30000');
    cy.get('select[name="workExperience[1].statusOfAppointment"]').select('Contractual');

    // Should show both work experiences
    cy.get('[data-testid="work-experience-item"]').should('have.length', 2);
  });

  it('should validate government ID formats', () => {
    const pdsData = {
      personalInformation: {
        surname: 'DELA CRUZ',
        firstName: 'JUAN',
        middleName: 'SANTOS',
        dateOfBirth: '01/15/1990',
        gsisIdNumber: 'invalid-format',
        sssNumber: 'invalid',
        tinNumber: '123',
        philHealthNumber: '12345',
      },
    };

    cy.fillPDSForm(pdsData);
    cy.get('button[type="submit"]').contains('Save PDS').click();

    cy.get('.error-message').should('contain', 'Invalid GSIS ID format');
    cy.get('.error-message').should('contain', 'Invalid SSS number format');
    cy.get('.error-message').should('contain', 'Invalid TIN format');
    cy.get('.error-message').should('contain', 'Invalid PhilHealth number format');
  });

  it('should validate reference name format', () => {
    // Scroll to references section
    cy.get('h2').contains('References').scrollIntoView();

    // Add reference with wrong format
    cy.get('input[name="references[0].name"]').type('Juan Dela Cruz');
    cy.get('input[name="references[0].address"]').type('123 Main St, Manila');
    cy.get('input[name="references[0].telephoneNumber"]').type('02-1234567');

    cy.get('button[type="submit"]').contains('Save PDS').click();

    cy.get('.error-message').should('contain', 'Reference name should be in format: FIRST NAME, MI, SURNAME');
  });

  it('should handle copy from residential to permanent address', () => {
    const residentialAddress = {
      houseBlockLotNumber: '123',
      street: 'Main Street',
      subdivision: 'Happy Subdivision',
      barangay: 'Barangay 456',
      cityMunicipality: 'Quezon City',
      province: 'Metro Manila',
      zipCode: '1100',
    };

    // Fill residential address
    Object.entries(residentialAddress).forEach(([field, value]) => {
      cy.get(`input[name="personalInformation.residentialAddress.${field}"]`).type(value);
    });

    // Click copy button
    cy.get('button').contains('Same as Residential').click();

    // Check if permanent address fields are filled
    Object.entries(residentialAddress).forEach(([field, value]) => {
      cy.get(`input[name="personalInformation.permanentAddress.${field}"]`).should('have.value', value);
    });
  });
});