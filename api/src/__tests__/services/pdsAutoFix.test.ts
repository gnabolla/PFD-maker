import { PDSAutoFixService, AppliedFix } from '@/services/pdsAutoFix';
import { PDSData, PDSValidationResult, PDSValidationError } from '@/models/pds';

describe('PDSAutoFixService', () => {
  describe('fixDateFormat', () => {
    it('should fix various date formats to MM/DD/YYYY', () => {
      const testCases = [
        { input: '2024-01-15', expected: '01/15/2024' },
        { input: '15/01/2024', expected: '01/15/2024' },
        { input: '2024/01/15', expected: '01/15/2024' },
        { input: '01-15-2024', expected: '01/15/2024' },
        { input: '15-01-2024', expected: '01/15/2024' },
        { input: '2024.01.15', expected: '01/15/2024' },
        { input: '15.01.2024', expected: '01/15/2024' },
      ];

      testCases.forEach(({ input, expected }) => {
        const error: PDSValidationError = {
          field: 'test.date',
          message: 'Invalid date format',
          code: 'INVALID_DATE_FORMAT',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixDateFormat']('test.date', input, error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe(expected);
        expect(fix?.fixType).toBe('DATE_FORMAT_CORRECTION');
      });
    });

    it('should handle invalid dates', () => {
      const error: PDSValidationError = {
        field: 'test.date',
        message: 'Invalid date format',
        code: 'INVALID_DATE_FORMAT',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixDateFormat']('test.date', 'invalid-date', error);
      expect(fix).toBeNull();
    });

    it('should parse natural date strings', () => {
      const error: PDSValidationError = {
        field: 'test.date',
        message: 'Invalid date format',
        code: 'INVALID_DATE_FORMAT',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixDateFormat']('test.date', 'January 15, 2024', error);
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('01/15/2024');
    });
  });

  describe('fixAbbreviation', () => {
    it('should expand common government abbreviations', () => {
      const testCases = [
        { 
          input: 'CSC Regional Office', 
          expected: 'Civil Service Commission Regional Office' 
        },
        { 
          input: 'DepEd Division of Manila', 
          expected: 'Department of Education Division of Manila' 
        },
        { 
          input: 'DOH Medical Center', 
          expected: 'Department of Health Medical Center' 
        },
        { 
          input: 'DILG Provincial Office', 
          expected: 'Department of the Interior and Local Government Provincial Office' 
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const error: PDSValidationError = {
          field: 'test.institution',
          message: 'Abbreviation not allowed',
          code: 'ABBREVIATION_NOT_ALLOWED',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixAbbreviation']('test.institution', input, error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe(expected);
        expect(fix?.fixType).toBe('ABBREVIATION_EXPANSION');
      });
    });

    it('should expand multiple abbreviations in same text', () => {
      const error: PDSValidationError = {
        field: 'test.institution',
        message: 'Abbreviation not allowed',
        code: 'ABBREVIATION_NOT_ALLOWED',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixAbbreviation'](
        'test.institution', 
        'CSC-DOH Joint Training', 
        error
      );
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('Civil Service Commission-Department of Health Joint Training');
    });

    it('should preserve case for expanded abbreviations', () => {
      const error: PDSValidationError = {
        field: 'test.institution',
        message: 'Abbreviation not allowed',
        code: 'ABBREVIATION_NOT_ALLOWED',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixAbbreviation'](
        'test.institution', 
        'ABC Corp. and XYZ Inc.', 
        error
      );
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('ABC Corporation and XYZ Incorporated');
    });

    it('should return null if no abbreviations found', () => {
      const error: PDSValidationError = {
        field: 'test.institution',
        message: 'Abbreviation not allowed',
        code: 'ABBREVIATION_NOT_ALLOWED',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixAbbreviation'](
        'test.institution', 
        'University of the Philippines', 
        error
      );
      expect(fix).toBeNull();
    });
  });

  describe('fixNameFormat', () => {
    it('should fix reference name format', () => {
      const testCases = [
        { 
          input: 'Juan Dela Cruz', 
          expected: 'JUAN, D., CRUZ' 
        },
        { 
          input: 'Maria Santos Reyes', 
          expected: 'MARIA, S., REYES' 
        },
        { 
          input: 'Jose P Rizal', 
          expected: 'JOSE, P., RIZAL' 
        },
        { 
          input: 'Ana Marie C Garcia', 
          expected: 'ANA, M., C GARCIA' 
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const error: PDSValidationError = {
          field: 'references[0].name',
          message: 'Invalid name format',
          code: 'INVALID_NAME_FORMAT',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixNameFormat']('references[0].name', input, error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe(expected);
        expect(fix?.fixType).toBe('NAME_FORMAT_CORRECTION');
      });
    });

    it('should handle names with existing middle initial', () => {
      const error: PDSValidationError = {
        field: 'references[0].name',
        message: 'Invalid name format',
        code: 'INVALID_NAME_FORMAT',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixNameFormat']('references[0].name', 'Juan P. Dela Cruz', error);
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('JUAN, P., DELA CRUZ');
    });

    it('should return null for non-reference name fields', () => {
      const error: PDSValidationError = {
        field: 'personalInformation.firstName',
        message: 'Invalid name format',
        code: 'INVALID_NAME_FORMAT',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixNameFormat']('personalInformation.firstName', 'Juan', error);
      expect(fix).toBeNull();
    });
  });

  describe('fixEmailFormat', () => {
    it('should fix common email typos', () => {
      const testCases = [
        { input: 'user@gmail.co', expected: 'user@gmail.com' },
        { input: 'user@yahoo.co', expected: 'user@yahoo.com' },
        { input: 'user@hotmail.co', expected: 'user@hotmail.com' },
        { input: 'user@gmial.com', expected: 'user@gmail.com' },
        { input: 'user@gmai.com', expected: 'user@gmail.com' },
        { input: 'user@yahooo.com', expected: 'user@yahoo.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const error: PDSValidationError = {
          field: 'email',
          message: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixEmailFormat']('email', input, error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe(expected);
        expect(fix?.fixType).toBe('EMAIL_FORMAT_CORRECTION');
      });
    });

    it('should convert email to lowercase and trim', () => {
      const error: PDSValidationError = {
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixEmailFormat']('email', '  USER@GMAIL.CO  ', error);
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('user@gmail.com');
    });
  });

  describe('fixCivilStatus', () => {
    it('should standardize civil status values', () => {
      const testCases = [
        { input: 'single', expected: 'Single' },
        { input: 'married', expected: 'Married' },
        { input: 'widowed', expected: 'Widowed' },
        { input: 'separated', expected: 'Separated' },
        { input: 'divorced', expected: 'Others' }, // Philippines specific
        { input: 'unmarried', expected: 'Single' },
        { input: 'wed', expected: 'Married' },
      ];

      testCases.forEach(({ input, expected }) => {
        const error: PDSValidationError = {
          field: 'civilStatus',
          message: 'Invalid civil status',
          code: 'INVALID_CIVIL_STATUS',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixCivilStatus']('civilStatus', input, error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe(expected);
        expect(fix?.fixType).toBe('CIVIL_STATUS_CORRECTION');
      });
    });

    it('should handle case variations', () => {
      const error: PDSValidationError = {
        field: 'civilStatus',
        message: 'Invalid civil status',
        code: 'INVALID_CIVIL_STATUS',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixCivilStatus']('civilStatus', ' SINGLE ', error);
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('Single');
    });
  });

  describe('fixSalaryGradeFormat', () => {
    it('should fix salary grade formats', () => {
      const testCases = [
        { input: '15 1', expected: '15-1' },
        { input: '24_2', expected: '24-2' },
        { input: '9-1', expected: '09-1' },
        { input: '33 1', expected: '33-1' },
      ];

      testCases.forEach(({ input, expected }) => {
        const error: PDSValidationError = {
          field: 'salaryGrade',
          message: 'Invalid salary grade format',
          code: 'INVALID_SALARY_GRADE_FORMAT',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixSalaryGradeFormat']('salaryGrade', input, error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe(expected);
        expect(fix?.fixType).toBe('SALARY_GRADE_FORMAT_CORRECTION');
      });
    });

    it('should pad single digit grades with zero', () => {
      const error: PDSValidationError = {
        field: 'salaryGrade',
        message: 'Invalid salary grade format',
        code: 'INVALID_SALARY_GRADE_FORMAT',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixSalaryGradeFormat']('salaryGrade', '5-1', error);
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toBe('05-1');
    });
  });

  describe('fixRequiredField', () => {
    it('should add N/A to non-critical required fields', () => {
      const nonCriticalFields = [
        'nameExtension',
        'civilStatusDetails',
        'telephoneNumber',
        'gsisId',
        'pagibigId',
      ];

      nonCriticalFields.forEach(field => {
        const error: PDSValidationError = {
          field: `personalInformation.${field}`,
          message: 'Required field',
          code: 'REQUIRED_FIELD',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixRequiredField'](`personalInformation.${field}`, '', error);
        expect(fix).not.toBeNull();
        expect(fix?.correctedValue).toBe('N/A');
        expect(fix?.fixType).toBe('REQUIRED_FIELD_NA');
      });
    });

    it('should not fix critical required fields', () => {
      const criticalFields = ['surname', 'firstName', 'middleName', 'dateOfBirth'];

      criticalFields.forEach(field => {
        const error: PDSValidationError = {
          field: `personalInformation.${field}`,
          message: 'Required field',
          code: 'REQUIRED_FIELD',
          severity: 'error',
        };

        const fix = PDSAutoFixService['fixRequiredField'](`personalInformation.${field}`, '', error);
        expect(fix).toBeNull();
      });
    });
  });

  describe('fixEmptyField', () => {
    it('should add N/A to empty array fields in otherInformation', () => {
      const error: PDSValidationError = {
        field: 'otherInformation.specialSkillsHobbies',
        message: 'Empty field',
        code: 'EMPTY_FIELD',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixEmptyField']('otherInformation.specialSkillsHobbies', [], error);
      expect(fix).not.toBeNull();
      expect(fix?.correctedValue).toEqual(['N/A']);
      expect(fix?.fixType).toBe('EMPTY_FIELD_NA');
    });

    it('should not fix non-empty arrays', () => {
      const error: PDSValidationError = {
        field: 'otherInformation.specialSkillsHobbies',
        message: 'Empty field',
        code: 'EMPTY_FIELD',
        severity: 'error',
      };

      const fix = PDSAutoFixService['fixEmptyField']('otherInformation.specialSkillsHobbies', ['Programming'], error);
      expect(fix).toBeNull();
    });
  });

  describe('getNestedValue and setNestedValue', () => {
    it('should get nested values correctly', () => {
      const obj = {
        personalInformation: {
          surname: 'Dela Cruz',
          residentialAddress: {
            barangay: 'Barangay 1',
          },
        },
        workExperience: [
          { positionTitle: 'Developer' },
          { positionTitle: 'Manager' },
        ],
      };

      expect(PDSAutoFixService['getNestedValue'](obj, 'personalInformation.surname')).toBe('Dela Cruz');
      expect(PDSAutoFixService['getNestedValue'](obj, 'personalInformation.residentialAddress.barangay')).toBe('Barangay 1');
      expect(PDSAutoFixService['getNestedValue'](obj, 'workExperience[0].positionTitle')).toBe('Developer');
      expect(PDSAutoFixService['getNestedValue'](obj, 'workExperience[1].positionTitle')).toBe('Manager');
    });

    it('should set nested values correctly', () => {
      const obj: any = {};

      PDSAutoFixService['setNestedValue'](obj, 'personalInformation.surname', 'Santos');
      expect(obj.personalInformation.surname).toBe('Santos');

      PDSAutoFixService['setNestedValue'](obj, 'workExperience[0].positionTitle', 'Engineer');
      expect(obj.workExperience[0].positionTitle).toBe('Engineer');

      PDSAutoFixService['setNestedValue'](obj, 'personalInformation.residentialAddress.barangay', 'Barangay 2');
      expect(obj.personalInformation.residentialAddress.barangay).toBe('Barangay 2');
    });
  });

  describe('autoFixPDS', () => {
    it('should apply multiple fixes to PDS data', () => {
      const pdsData: Partial<PDSData> = {
        personalInformation: {
          surname: 'Dela Cruz',
          firstName: 'Juan',
          middleName: 'Santos',
          dateOfBirth: '1990-01-15', // Wrong format
          civilStatus: 'single', // Wrong case
          emailAddress: 'juan@gmail.co', // Common typo
        } as any,
        educationalBackground: {
          elementary: {
            nameOfSchool: 'CSC Elementary School', // Has abbreviation
          } as any,
        } as any,
        otherInformation: {
          specialSkillsHobbies: [], // Empty array
        } as any,
      };

      const validationResult: PDSValidationResult = {
        isValid: false,
        errors: [
          {
            field: 'personalInformation.dateOfBirth',
            message: 'Invalid date format',
            code: 'INVALID_DATE_FORMAT',
            severity: 'error',
          },
          {
            field: 'personalInformation.civilStatus',
            message: 'Invalid civil status',
            code: 'INVALID_CIVIL_STATUS',
            severity: 'error',
          },
          {
            field: 'personalInformation.emailAddress',
            message: 'Invalid email format',
            code: 'INVALID_EMAIL_FORMAT',
            severity: 'error',
          },
          {
            field: 'educationalBackground.elementary.nameOfSchool',
            message: 'Abbreviation not allowed',
            code: 'ABBREVIATION_NOT_ALLOWED',
            severity: 'error',
          },
          {
            field: 'otherInformation.specialSkillsHobbies',
            message: 'Empty field',
            code: 'EMPTY_FIELD',
            severity: 'error',
          },
        ],
        warnings: [],
      };

      const result = PDSAutoFixService.autoFixPDS(pdsData as PDSData, validationResult);

      expect(result.fixesApplied).toHaveLength(5);
      expect(result.unfixableErrors).toHaveLength(0);
      expect(result.correctedData.personalInformation.dateOfBirth).toBe('01/15/1990');
      expect(result.correctedData.personalInformation.civilStatus).toBe('Single');
      expect(result.correctedData.personalInformation.emailAddress).toBe('juan@gmail.com');
      expect(result.correctedData.educationalBackground.elementary.nameOfSchool).toBe('Civil Service Commission Elementary School');
      expect(result.correctedData.otherInformation.specialSkillsHobbies).toEqual(['N/A']);
    });

    it('should handle unfixable errors', () => {
      const pdsData: Partial<PDSData> = {
        personalInformation: {
          surname: '', // Critical required field
          firstName: '',
        } as any,
      };

      const validationResult: PDSValidationResult = {
        isValid: false,
        errors: [
          {
            field: 'personalInformation.surname',
            message: 'Required field',
            code: 'REQUIRED_FIELD',
            severity: 'error',
          },
          {
            field: 'personalInformation.firstName',
            message: 'Required field',
            code: 'REQUIRED_FIELD',
            severity: 'error',
          },
        ],
        warnings: [],
      };

      const result = PDSAutoFixService.autoFixPDS(pdsData as PDSData, validationResult);

      expect(result.fixesApplied).toHaveLength(0);
      expect(result.unfixableErrors).toHaveLength(2);
    });

    it('should generate appropriate fix summary', () => {
      const pdsData: Partial<PDSData> = {
        personalInformation: {
          dateOfBirth: '1990-01-15',
          civilStatus: 'single',
        } as any,
      };

      const validationResult: PDSValidationResult = {
        isValid: false,
        errors: [
          {
            field: 'personalInformation.dateOfBirth',
            message: 'Invalid date format',
            code: 'INVALID_DATE_FORMAT',
            severity: 'error',
          },
          {
            field: 'personalInformation.civilStatus',
            message: 'Invalid civil status',
            code: 'INVALID_CIVIL_STATUS',
            severity: 'error',
          },
        ],
        warnings: [],
      };

      const result = PDSAutoFixService.autoFixPDS(pdsData as PDSData, validationResult);

      expect(result.fixSummary).toContain('Applied 2 automatic fixes');
      expect(result.fixSummary).toContain('1 date format corrected');
      expect(result.fixSummary).toContain('1 civil status value standardized');
    });
  });
});