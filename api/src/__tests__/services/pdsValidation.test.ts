import { PDSValidationService } from '@/services/pdsValidation';
import { PDSData } from '@/models/pds';

describe('PDSValidationService', () => {
  describe('validateDateFormat', () => {
    it('should validate correct MM/DD/YYYY format', () => {
      const validDates = [
        '01/01/2000',
        '12/31/2024',
        '02/29/2020', // leap year
        '06/15/1990',
      ];

      validDates.forEach(date => {
        const result = PDSValidationService['validateDateFormat'](date);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid date formats', () => {
      const invalidDates = [
        '2024-01-01', // wrong format
        '01-01-2024', // wrong separator
        '1/1/2024', // missing leading zeros
        '13/01/2024', // invalid month
        '01/32/2024', // invalid day
        '02/30/2024', // invalid date
        '02/29/2021', // non-leap year
        'invalid',
        '',
        null as any,
        undefined as any,
      ];

      invalidDates.forEach(date => {
        const result = PDSValidationService['validateDateFormat'](date);
        expect(result).toBe(false);
      });
    });
  });

  describe('containsAbbreviation', () => {
    it('should detect common abbreviations', () => {
      const textsWithAbbreviations = [
        'CSC Regional Office',
        'DepEd Division Office',
        'DOH Hospital',
        'Univ. of the Philippines',
        'ABC Corp.',
        'XYZ Inc.',
        'Civil Service Commission (CSC)',
      ];

      textsWithAbbreviations.forEach(text => {
        const result = PDSValidationService['containsAbbreviation'](text);
        expect(result).toBe(true);
      });
    });

    it('should not flag text without abbreviations', () => {
      const textsWithoutAbbreviations = [
        'Civil Service Commission',
        'Department of Health',
        'University of the Philippines',
        'Saint Mary\'s Academy',
        'Government Service Insurance System',
      ];

      textsWithoutAbbreviations.forEach(text => {
        const result = PDSValidationService['containsAbbreviation'](text);
        expect(result).toBe(false);
      });
    });
  });

  describe('validateEmailFormat', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@gov.ph',
        'test123@company.com.ph',
        'admin+test@domain.org',
      ];

      validEmails.forEach(email => {
        const result = PDSValidationService['validateEmailFormat'](email);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid.email',
        '@domain.com',
        'user@',
        'user space@domain.com',
        'user@domain',
        '',
      ];

      invalidEmails.forEach(email => {
        const result = PDSValidationService['validateEmailFormat'](email);
        expect(result).toBe(false);
      });
    });
  });

  describe('validateReferenceNameFormat', () => {
    it('should validate correct reference name formats', () => {
      const validNames = [
        'JUAN, P., DELA CRUZ',
        'MARIA, A, SANTOS',
        'JOSE, B., REYES',
        'ANA MARIE, C., GARCIA',
      ];

      validNames.forEach(name => {
        const result = PDSValidationService['validateReferenceNameFormat'](name);
        expect(result).toBe(true);
      });
    });

    it('should reject invalid reference name formats', () => {
      const invalidNames = [
        'Juan Dela Cruz',
        'DELA CRUZ, JUAN',
        'Juan P. Dela Cruz',
        'JUAN DELA CRUZ',
        '',
      ];

      invalidNames.forEach(name => {
        const result = PDSValidationService['validateReferenceNameFormat'](name);
        expect(result).toBe(false);
      });
    });
  });

  describe('validateField', () => {
    it('should validate date fields', () => {
      const result = PDSValidationService.validateField('personalInformation.dateOfBirth', '01/15/1990');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should provide suggestions for invalid date fields', () => {
      const result = PDSValidationService.validateField('personalInformation.dateOfBirth', '1990-01-15');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_DATE_FORMAT');
      expect(result.suggestions).toContain('Use MM/DD/YYYY format (e.g., 12/31/1990)');
    });

    it('should validate email fields', () => {
      const result = PDSValidationService.validateField('personalInformation.emailAddress', 'test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate required name fields', () => {
      const result = PDSValidationService.validateField('personalInformation.surname', '');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('REQUIRED_FIELD');
    });

    it('should validate civil status', () => {
      const result = PDSValidationService.validateField('personalInformation.civilStatus', 'Married');
      expect(result.isValid).toBe(true);

      const invalidResult = PDSValidationService.validateField('personalInformation.civilStatus', 'Divorced');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.suggestions).toContain('Must be one of: Single, Married, Widowed, Separated, Others');
    });

    it('should check for abbreviations in institution names', () => {
      const result = PDSValidationService.validateField('educationalBackground.elementary.nameOfSchool', 'ABC Elem. School');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('ABBREVIATION_NOT_ALLOWED');
      expect(result.suggestions).toContain('Use full names without abbreviations');
    });
  });

  describe('validatePDS', () => {
    let validPDSData: PDSData;

    beforeEach(() => {
      validPDSData = {
        personalInformation: {
          surname: 'DELA CRUZ',
          firstName: 'JUAN',
          middleName: 'SANTOS',
          nameExtension: '',
          dateOfBirth: '01/15/1990',
          placeOfBirth: 'Manila',
          sex: 'Male',
          civilStatus: 'Single',
          civilStatusDetails: '',
          citizenship: 'Filipino',
          height: 175,
          weight: 70,
          bloodType: 'O+',
          gsisIdNumber: '1234567890',
          pagIbigIdNumber: '1234567890',
          philHealthNumber: '12-345678901-2',
          sssNumber: '12-3456789-0',
          tinNumber: '123-456-789',
          agencyEmployeeNumber: 'EMP001',
          residentialAddress: {
            houseBlockLotNumber: '123',
            street: 'Main St',
            subdivision: 'Subdivision',
            barangay: 'Barangay 1',
            cityMunicipality: 'Manila',
            province: 'Metro Manila',
            zipCode: '1000',
          },
          permanentAddress: {
            houseBlockLotNumber: '123',
            street: 'Main St',
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
        familyBackground: {
          spouse: {
            surname: '',
            firstName: '',
            middleName: '',
            nameExtension: '',
            occupation: '',
            employerBusinessName: '',
            businessAddress: '',
            telephoneNumber: '',
          },
          father: {
            surname: 'DELA CRUZ',
            firstName: 'PEDRO',
            middleName: 'GARCIA',
            nameExtension: '',
          },
          mother: {
            maidenName: 'SANTOS',
            surname: 'DELA CRUZ',
            firstName: 'MARIA',
            middleName: 'REYES',
          },
          children: [],
        },
        educationalBackground: {
          elementary: {
            nameOfSchool: 'Manila Elementary School',
            basicEducationDegreeCourse: 'ELEMENTARY',
            periodOfAttendance: { from: '1996', to: '2002' },
            highestLevelUnitsEarned: 'Graduated',
            yearGraduated: '2002',
            scholarshipAcademicHonorsReceived: '',
          },
          secondary: {
            nameOfSchool: 'Manila High School',
            basicEducationDegreeCourse: 'HIGH SCHOOL',
            periodOfAttendance: { from: '2002', to: '2006' },
            highestLevelUnitsEarned: 'Graduated',
            yearGraduated: '2006',
            scholarshipAcademicHonorsReceived: '',
          },
          vocational: {
            nameOfSchool: '',
            basicEducationDegreeCourse: '',
            periodOfAttendance: { from: '', to: '' },
            highestLevelUnitsEarned: '',
            yearGraduated: '',
            scholarshipAcademicHonorsReceived: '',
          },
          college: {
            nameOfSchool: 'University of the Philippines',
            basicEducationDegreeCourse: 'Bachelor of Science in Computer Science',
            periodOfAttendance: { from: '2006', to: '2010' },
            highestLevelUnitsEarned: 'Graduated',
            yearGraduated: '2010',
            scholarshipAcademicHonorsReceived: 'Cum Laude',
          },
          graduate: {
            nameOfSchool: '',
            basicEducationDegreeCourse: '',
            periodOfAttendance: { from: '', to: '' },
            highestLevelUnitsEarned: '',
            yearGraduated: '',
            scholarshipAcademicHonorsReceived: '',
          },
        },
        civilServiceEligibility: [],
        workExperience: [],
        voluntaryWork: [],
        learningAndDevelopment: [],
        otherInformation: {
          specialSkillsHobbies: ['Programming', 'Reading'],
          nonAcademicDistinctions: [],
          memberships: [],
        },
        questionsAnswers: {
          question34: { answer: false, details: '' },
          question35: { answer: false, details: '' },
          question36: { answer: false, details: '' },
          question37: { answer: false, details: '' },
          question38: { answer: false, details: '' },
          question39: { answer: false, details: '' },
          question40: { answer: false, details: '' },
        },
        references: [
          {
            name: 'JOSE, M., RIZAL',
            address: '123 Main St, Manila',
            telephoneNumber: '02-1234567',
          },
          {
            name: 'ANDRES, B., BONIFACIO',
            address: '456 Second St, Quezon City',
            telephoneNumber: '02-7654321',
          },
          {
            name: 'APOLINARIO, M., MABINI',
            address: '789 Third St, Makati',
            telephoneNumber: '02-9876543',
          },
        ],
        signature: 'JUAN S. DELA CRUZ',
        dateAccomplished: '01/01/2024',
        rightThumbMark: 'Thumbmark',
        personAdministering: {
          name: '',
          position: '',
          dateOathTaken: '',
        },
        governmentIdType: 'Driver\'s License',
        governmentIdNumber: 'N01-23-456789',
        governmentIdIssuanceDate: '01/01/2023',
        governmentIdIssuancePlace: 'LTO Manila',
        passportSizePhoto: 'photo.jpg',
      };
    });

    it('should validate a complete valid PDS', () => {
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      validPDSData.personalInformation.surname = '';
      validPDSData.personalInformation.firstName = '';
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'personalInformation.surname')).toBe(true);
      expect(result.errors.some(e => e.field === 'personalInformation.firstName')).toBe(true);
    });

    it('should detect invalid date formats', () => {
      validPDSData.personalInformation.dateOfBirth = '1990-01-15';
      validPDSData.dateAccomplished = '2024/01/01';
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'personalInformation.dateOfBirth')).toBe(true);
      expect(result.errors.some(e => e.field === 'dateAccomplished')).toBe(true);
    });

    it('should detect abbreviations in school names', () => {
      validPDSData.educationalBackground.elementary.nameOfSchool = 'Manila Elem. School';
      validPDSData.educationalBackground.college.nameOfSchool = 'UP Diliman';
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'educationalBackground.elementary.nameOfSchool' && 
        e.code === 'ABBREVIATION_NOT_ALLOWED'
      )).toBe(true);
    });

    it('should validate work experience dates and fields', () => {
      validPDSData.workExperience = [{
        inclusiveDates: { from: '01/01/2020', to: 'Present' },
        positionTitle: 'Sr. Software Engineer', // abbreviation
        departmentAgencyOfficeCompany: 'ABC Corp.', // abbreviation
        monthlySalary: -5000, // negative salary
        salaryGrade: '15-1-1', // invalid format
        statusOfAppointment: 'Full-time', // invalid status
        governmentService: true,
      }];
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('positionTitle'))).toBe(true);
      expect(result.errors.some(e => e.field.includes('departmentAgencyOfficeCompany'))).toBe(true);
      expect(result.errors.some(e => e.field.includes('monthlySalary'))).toBe(true);
      expect(result.errors.some(e => e.field.includes('salaryGrade'))).toBe(true);
      expect(result.errors.some(e => e.field.includes('statusOfAppointment'))).toBe(true);
    });

    it('should validate questions with yes answers require details', () => {
      validPDSData.questionsAnswers.question34 = { answer: true, details: '' };
      validPDSData.questionsAnswers.question35 = { answer: true, details: '' };
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'questionsAnswers.question34.details' && 
        e.code === 'REQUIRED_DETAILS'
      )).toBe(true);
    });

    it('should validate civil status "Others" requires details', () => {
      validPDSData.personalInformation.civilStatus = 'Others';
      validPDSData.personalInformation.civilStatusDetails = '';
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'personalInformation.civilStatusDetails' && 
        e.code === 'REQUIRED_DETAILS'
      )).toBe(true);
    });

    it('should validate learning and development fields', () => {
      validPDSData.learningAndDevelopment = [{
        titleOfLearningAndDevelopmentInterventionsTrainingPrograms: 'Leadership Training',
        inclusiveDates: { from: '01/01/2023', to: '01/05/2023' },
        numberOfHours: 0, // invalid hours
        type: 'Leadership', // invalid type
        conductedSponsoredBy: 'CSC Regional Office', // contains abbreviation
      }];
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('numberOfHours'))).toBe(true);
      expect(result.errors.some(e => e.field.includes('type'))).toBe(true);
      expect(result.errors.some(e => e.field.includes('conductedSponsoredBy'))).toBe(true);
    });

    it('should validate empty arrays that should use "N/A"', () => {
      validPDSData.otherInformation.specialSkillsHobbies = [];
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => 
        e.field === 'otherInformation.specialSkillsHobbies' && 
        e.code === 'EMPTY_FIELD'
      )).toBe(true);
    });

    it('should validate reference format and required fields', () => {
      validPDSData.references = [{
        name: 'Jose Rizal', // wrong format
        address: '',
        telephoneNumber: '',
      }];
      
      const result = PDSValidationService.validatePDS(validPDSData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field.includes('name') && e.code === 'INVALID_NAME_FORMAT')).toBe(true);
      expect(result.errors.some(e => e.field.includes('address') && e.code === 'REQUIRED_FIELD')).toBe(true);
      expect(result.errors.some(e => e.field.includes('telephoneNumber') && e.code === 'REQUIRED_FIELD')).toBe(true);
    });
  });
});