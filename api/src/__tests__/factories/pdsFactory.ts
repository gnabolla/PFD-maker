import { faker } from '@faker-js/faker';
import { PDSData } from '@/models/pds';
import { format } from 'date-fns';

export class PDSFactory {
  /**
   * Generate valid PDS data with all required fields
   */
  static createValid(overrides: Partial<PDSData> = {}): PDSData {
    const birthDate = faker.date.birthdate({ min: 25, max: 60, mode: 'age' });
    
    return {
      personalInformation: {
        surname: faker.person.lastName().toUpperCase(),
        firstName: faker.person.firstName().toUpperCase(),
        middleName: faker.person.middleName().toUpperCase(),
        nameExtension: faker.helpers.arrayElement(['', 'JR', 'SR', 'III', '']),
        dateOfBirth: format(birthDate, 'MM/dd/yyyy'),
        placeOfBirth: faker.location.city(),
        sex: faker.person.sex() === 'male' ? 'Male' : 'Female',
        civilStatus: faker.helpers.arrayElement(['Single', 'Married', 'Widowed', 'Separated']),
        civilStatusDetails: '',
        citizenship: 'Filipino',
        dualCitizenship: '',
        height: faker.number.int({ min: 150, max: 190 }),
        weight: faker.number.int({ min: 45, max: 100 }),
        bloodType: faker.helpers.arrayElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
        gsisIdNumber: faker.string.numeric(10),
        pagIbigIdNumber: faker.string.numeric(12),
        philHealthNumber: `${faker.string.numeric(2)}-${faker.string.numeric(9)}-${faker.string.numeric(1)}`,
        sssNumber: `${faker.string.numeric(2)}-${faker.string.numeric(7)}-${faker.string.numeric(1)}`,
        tinNumber: `${faker.string.numeric(3)}-${faker.string.numeric(3)}-${faker.string.numeric(3)}`,
        agencyEmployeeNumber: `EMP${faker.string.numeric(6)}`,
        residentialAddress: {
          houseBlockLotNumber: faker.location.buildingNumber(),
          street: faker.location.street(),
          subdivision: faker.location.streetAddress(),
          barangay: `Barangay ${faker.number.int({ min: 1, max: 100 })}`,
          cityMunicipality: faker.location.city(),
          province: faker.location.state(),
          zipCode: faker.location.zipCode('####'),
        },
        permanentAddress: {
          houseBlockLotNumber: faker.location.buildingNumber(),
          street: faker.location.street(),
          subdivision: faker.location.streetAddress(),
          barangay: `Barangay ${faker.number.int({ min: 1, max: 100 })}`,
          cityMunicipality: faker.location.city(),
          province: faker.location.state(),
          zipCode: faker.location.zipCode('####'),
        },
        telephoneNumber: `02-${faker.string.numeric(7)}`,
        mobileNumber: `09${faker.string.numeric(9)}`,
        emailAddress: faker.internet.email().toLowerCase(),
        ...overrides.personalInformation,
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
          surname: faker.person.lastName().toUpperCase(),
          firstName: faker.person.firstName('male').toUpperCase(),
          middleName: faker.person.middleName('male').toUpperCase(),
          nameExtension: '',
        },
        mother: {
          maidenName: faker.person.lastName().toUpperCase(),
          surname: faker.person.lastName().toUpperCase(),
          firstName: faker.person.firstName('female').toUpperCase(),
          middleName: faker.person.middleName('female').toUpperCase(),
        },
        children: [],
        ...overrides.familyBackground,
      },
      educationalBackground: {
        elementary: {
          nameOfSchool: `${faker.location.city()} Elementary School`,
          basicEducationDegreeCourse: 'ELEMENTARY',
          periodOfAttendance: { from: '1990', to: '1996' },
          highestLevelUnitsEarned: 'Graduated',
          yearGraduated: '1996',
          scholarshipAcademicHonorsReceived: '',
        },
        secondary: {
          nameOfSchool: `${faker.location.city()} High School`,
          basicEducationDegreeCourse: 'HIGH SCHOOL',
          periodOfAttendance: { from: '1996', to: '2000' },
          highestLevelUnitsEarned: 'Graduated',
          yearGraduated: '2000',
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
          nameOfSchool: `University of ${faker.location.city()}`,
          basicEducationDegreeCourse: faker.helpers.arrayElement([
            'Bachelor of Science in Computer Science',
            'Bachelor of Arts in Communication',
            'Bachelor of Science in Business Administration',
            'Bachelor of Science in Engineering',
          ]),
          periodOfAttendance: { from: '2000', to: '2004' },
          highestLevelUnitsEarned: 'Graduated',
          yearGraduated: '2004',
          scholarshipAcademicHonorsReceived: faker.helpers.arrayElement(['', 'Cum Laude', 'Magna Cum Laude', '']),
        },
        graduate: {
          nameOfSchool: '',
          basicEducationDegreeCourse: '',
          periodOfAttendance: { from: '', to: '' },
          highestLevelUnitsEarned: '',
          yearGraduated: '',
          scholarshipAcademicHonorsReceived: '',
        },
        ...overrides.educationalBackground,
      },
      civilServiceEligibility: [],
      workExperience: [],
      voluntaryWork: [],
      learningAndDevelopment: [],
      otherInformation: {
        specialSkillsHobbies: ['Programming', 'Reading', 'Sports'],
        nonAcademicDistinctions: [],
        memberships: [],
        ...overrides.otherInformation,
      },
      questionsAnswers: {
        question34: { answer: false, details: '' },
        question35: { answer: false, details: '' },
        question36: { answer: false, details: '' },
        question37: { answer: false, details: '' },
        question38: { answer: false, details: '' },
        question39: { answer: false, details: '' },
        question40: { answer: false, details: '' },
        ...overrides.questionsAnswers,
      },
      references: [
        {
          name: `${faker.person.firstName().toUpperCase()}, ${faker.person.middleName().charAt(0).toUpperCase()}., ${faker.person.lastName().toUpperCase()}`,
          address: faker.location.streetAddress(),
          telephoneNumber: `02-${faker.string.numeric(7)}`,
        },
        {
          name: `${faker.person.firstName().toUpperCase()}, ${faker.person.middleName().charAt(0).toUpperCase()}., ${faker.person.lastName().toUpperCase()}`,
          address: faker.location.streetAddress(),
          telephoneNumber: `02-${faker.string.numeric(7)}`,
        },
        {
          name: `${faker.person.firstName().toUpperCase()}, ${faker.person.middleName().charAt(0).toUpperCase()}., ${faker.person.lastName().toUpperCase()}`,
          address: faker.location.streetAddress(),
          telephoneNumber: `02-${faker.string.numeric(7)}`,
        },
      ],
      signature: faker.person.fullName().toUpperCase(),
      dateAccomplished: format(new Date(), 'MM/dd/yyyy'),
      rightThumbMark: 'Thumbmark',
      personAdministering: {
        name: '',
        position: '',
        dateOathTaken: '',
      },
      governmentIdType: faker.helpers.arrayElement(["Driver's License", 'Passport', 'SSS ID', 'GSIS ID']),
      governmentIdNumber: faker.string.alphanumeric(12).toUpperCase(),
      governmentIdIssuanceDate: format(faker.date.recent({ days: 365 }), 'MM/dd/yyyy'),
      governmentIdIssuancePlace: faker.location.city(),
      passportSizePhoto: 'photo.jpg',
      ...overrides,
    };
  }

  /**
   * Generate PDS data with invalid date formats
   */
  static createWithInvalidDates(overrides: Partial<PDSData> = {}): PDSData {
    const validPDS = this.createValid();
    
    return {
      ...validPDS,
      personalInformation: {
        ...validPDS.personalInformation,
        dateOfBirth: '1990-01-15', // Invalid format
      },
      dateAccomplished: '2024/01/01', // Invalid format
      governmentIdIssuanceDate: '01-01-2023', // Invalid format
      ...overrides,
    };
  }

  /**
   * Generate PDS data with abbreviations
   */
  static createWithAbbreviations(overrides: Partial<PDSData> = {}): PDSData {
    const validPDS = this.createValid();
    
    return {
      ...validPDS,
      educationalBackground: {
        ...validPDS.educationalBackground,
        elementary: {
          ...validPDS.educationalBackground.elementary,
          nameOfSchool: 'CSC Elem. School', // Contains abbreviation
        },
        college: {
          ...validPDS.educationalBackground.college,
          nameOfSchool: 'UP Diliman', // Contains abbreviation
        },
      },
      workExperience: [
        {
          inclusiveDates: { from: '01/01/2020', to: 'Present' },
          positionTitle: 'Sr. Manager', // Contains abbreviation
          departmentAgencyOfficeCompany: 'DOH Regional Office', // Contains abbreviation
          monthlySalary: 50000,
          salaryGrade: '24-1',
          statusOfAppointment: 'Permanent',
          governmentService: true,
        },
      ],
      learningAndDevelopment: [
        {
          titleOfLearningAndDevelopmentInterventionsTrainingPrograms: 'Leadership Training',
          inclusiveDates: { from: '01/01/2023', to: '01/05/2023' },
          numberOfHours: 40,
          type: 'Managerial',
          conductedSponsoredBy: 'CSC Regional Office', // Contains abbreviation
        },
      ],
      ...overrides,
    };
  }

  /**
   * Generate PDS data with missing required fields
   */
  static createWithMissingFields(overrides: Partial<PDSData> = {}): Partial<PDSData> {
    return {
      personalInformation: {
        surname: '', // Missing required field
        firstName: '', // Missing required field
        middleName: '', // Missing required field
        dateOfBirth: '',
        sex: 'Male',
        civilStatus: 'Single',
        residentialAddress: {
          houseBlockLotNumber: '',
          street: '',
          subdivision: '',
          barangay: '', // Missing required field
          cityMunicipality: '', // Missing required field
          province: '', // Missing required field
          zipCode: '', // Missing required field
        },
        permanentAddress: {
          houseBlockLotNumber: '',
          street: '',
          subdivision: '',
          barangay: '',
          cityMunicipality: '',
          province: '',
          zipCode: '',
        },
      },
      ...overrides,
    };
  }

  /**
   * Generate work experience data
   */
  static createWorkExperience(count: number = 1, overrides: Partial<PDSData['workExperience'][0]> = {}) {
    const experiences = [];
    
    for (let i = 0; i < count; i++) {
      const startDate = faker.date.past({ years: 10 });
      const endDate = faker.date.between({ from: startDate, to: new Date() });
      
      experiences.push({
        inclusiveDates: {
          from: format(startDate, 'MM/dd/yyyy'),
          to: i === 0 ? 'Present' : format(endDate, 'MM/dd/yyyy'),
        },
        positionTitle: faker.person.jobTitle(),
        departmentAgencyOfficeCompany: faker.company.name(),
        monthlySalary: faker.number.int({ min: 20000, max: 100000 }),
        salaryGrade: `${faker.number.int({ min: 10, max: 33 })}-${faker.number.int({ min: 1, max: 8 })}`,
        statusOfAppointment: faker.helpers.arrayElement(['Permanent', 'Temporary', 'Casual', 'Contractual']),
        governmentService: faker.datatype.boolean(),
        ...overrides,
      });
    }
    
    return experiences;
  }

  /**
   * Generate civil service eligibility data
   */
  static createCivilServiceEligibility(count: number = 1) {
    const eligibilities = [];
    
    for (let i = 0; i < count; i++) {
      const examDate = faker.date.past({ years: 5 });
      
      eligibilities.push({
        careerServiceBoardBarLicensura: faker.helpers.arrayElement([
          'Career Service Professional',
          'Career Service Sub-Professional',
          'Bar Examination',
          'Board Licensure Examination',
        ]),
        rating: faker.number.float({ min: 80, max: 95, fractionDigits: 2 }).toString(),
        dateOfExaminationConferment: format(examDate, 'MM/dd/yyyy'),
        placeOfExaminationConferment: faker.location.city(),
        licenseNumber: faker.string.alphanumeric(10).toUpperCase(),
        licenseValidityDate: format(faker.date.future({ years: 5 }), 'MM/dd/yyyy'),
      });
    }
    
    return eligibilities;
  }

  /**
   * Generate minimal valid PDS (only required fields)
   */
  static createMinimal(): PDSData {
    return this.createValid({
      personalInformation: {
        nameExtension: '',
        telephoneNumber: 'N/A',
        gsisIdNumber: 'N/A',
        pagIbigIdNumber: 'N/A',
        philHealthNumber: 'N/A',
        sssNumber: 'N/A',
        tinNumber: 'N/A',
        agencyEmployeeNumber: 'N/A',
      } as any,
      educationalBackground: {
        vocational: undefined,
        graduate: undefined,
      } as any,
      civilServiceEligibility: [],
      workExperience: [],
      voluntaryWork: [],
      learningAndDevelopment: [],
      otherInformation: {
        specialSkillsHobbies: ['N/A'],
        nonAcademicDistinctions: [],
        memberships: [],
      },
    });
  }
}