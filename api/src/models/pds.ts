// PDS Data Models based on CS Form No. 212 (Revised 2017)

export interface PersonalInformation {
  // Name format: surname, first name, name extension (if any), middle name
  surname: string;
  firstName: string;
  nameExtension?: string;
  middleName: string;
  
  // Date of birth in numeric format: mm/dd/yyyy
  dateOfBirth: string;
  placeOfBirth: string;
  
  // Civil status
  civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Others';
  civilStatusDetails?: string; // For "Others" response
  
  // Physical attributes
  height: string; // in meters
  weight: string; // in kilograms
  bloodType: string;
  
  // Government identification
  gsisId?: string;
  pagibigId?: string;
  philhealthId?: string;
  sssId?: string;
  tinId?: string;
  agencyEmployeeId?: string;
  
  // Citizenship
  citizenship: string;
  dualCitizenship?: string; // For dual citizenship holders
  
  // Address
  residentialAddress: Address;
  permanentAddress: Address;
  
  // Contact information
  telephoneNumber?: string;
  mobileNumber?: string;
  emailAddress?: string;
}\n\nexport interface Address {\n  houseBlockLotNumber: string;\n  street: string;\n  subdivisionVillage: string;\n  barangay: string;\n  cityMunicipality: string;\n  province: string;\n  zipCode: string;\n}\n\nexport interface FamilyBackground {\n  spouse?: {\n    surname: string;\n    firstName: string;\n    nameExtension?: string;\n    middleName: string;\n    occupation: string;\n    employerBusinessName: string;\n    businessAddress: string;\n    telephoneNumber?: string;\n  };\n  \n  father: {\n    surname: string;\n    firstName: string;\n    nameExtension?: string;\n    middleName: string;\n  };\n  \n  mother: {\n    maidenName: string; // Mother's maiden name\n    surname: string;\n    firstName: string;\n    middleName: string;\n  };\n  \n  children: Array<{\n    fullName: string; // Full name (first name and surname)\n    dateOfBirth: string; // mm/dd/yyyy format\n  }>;\n}\n\nexport interface EducationalBackground {\n  elementary: EducationLevel;\n  secondary: EducationLevel;\n  vocational?: EducationLevel;\n  college?: EducationLevel;\n  graduateStudies?: EducationLevel[];\n}\n\nexport interface EducationLevel {\n  nameOfSchool: string; // FULL name, DO NOT ABBREVIATE\n  basicEducationDegreeCourse: string; // e.g., ELEMENTARY, HIGH SCHOOL, JUNIOR HIGH SCHOOL, SENIOR HIGH SCHOOL\n  periodOfAttendance: {\n    from: string; // School year format (e.g., 1992)\n    to: string; // School year format (e.g., 1996)\n  };\n  highestLevelUnitsEarned?: string; // If not graduated\n  yearGraduated?: string; // If graduated\n  scholarshipAcademicHonorsReceived?: string;\n}\n\nexport interface CivilServiceEligibility {\n  careerService: string;\n  rating: string;\n  dateOfExaminationConferment: string; // mm/dd/yyyy\n  placeOfExaminationConferment: string;\n  licenseNumber?: string; // If eligibility entails a license\n  licenseValidityDate?: string; // mm/dd/yyyy\n}\n\nexport interface WorkExperience {\n  inclusiveDates: {\n    from: string; // mm/dd/yyyy\n    to: string; // mm/dd/yyyy or \"Present\"\n  };\n  positionTitle: string; // FULL position title, DO NOT ABBREVIATE\n  departmentAgencyOfficeCompany: string; // COMPLETE NAME, DO NOT ABBREVIATE\n  monthlySalary: number; // In figures (e.g., 21877)\n  salaryGrade?: string; // Format: '00-0' (e.g., '24-2')\n  statusOfAppointment: 'Permanent' | 'Temporary' | 'Casual' | 'Contractual';\n  governmentService: boolean; // true for government, false for private\n}\n\nexport interface VoluntaryWork {\n  nameAndAddressOfOrganization: string; // FULL name and address\n  inclusiveDates: {\n    from: string; // mm/dd/yyyy\n    to: string; // mm/dd/yyyy\n  };\n  numberOfHours: number;\n  positionNatureOfWork: string;\n}\n\nexport interface LearningDevelopment {\n  title: string; // FULL title of L&D intervention\n  inclusiveDates: {\n    from: string; // mm/dd/yyyy\n    to: string; // mm/dd/yyyy\n  };\n  numberOfHours: number;\n  type: 'Managerial' | 'Supervisory' | 'Technical' | 'Foundation';\n  conductedSponsoredBy: string; // FULL name, DO NOT ABBREVIATE\n}\n\nexport interface OtherInformation {\n  specialSkillsHobbies: string[];\n  nonAcademicDistinctionsRecognitions: string[];\n  membershipInAssociationOrganization: string[];\n}\n\nexport interface QuestionsAnswers {\n  question34: { answer: boolean; details?: string }; // Criminal/admin offense charges\n  question35: { answer: boolean; details?: string }; // Criminal convictions\n  question36: { answer: boolean; details?: string }; // Administrative offense violations\n  question37: { answer: boolean; details?: string }; // Candidacy status\n  question38: { answer: boolean; details?: string }; // Resignation/retirement to avoid admin case\n  question39: { answer: boolean; details?: string }; // Immigrant/permanent resident status\n  question40: { answer: boolean; details?: string }; // Indigenous group membership\n}\n\nexport interface References {\n  name: string; // Format: FIRST NAME, MI, SURNAME\n  address: string;\n  telephoneNumber: string;\n}\n\nexport interface PDSData {\n  personalInformation: PersonalInformation;\n  familyBackground: FamilyBackground;\n  educationalBackground: EducationalBackground;\n  civilServiceEligibility: CivilServiceEligibility[];\n  workExperience: WorkExperience[];\n  voluntaryWork: VoluntaryWork[];\n  learningAndDevelopment: LearningDevelopment[];\n  otherInformation: OtherInformation;\n  questionsAnswers: QuestionsAnswers;\n  references: References[];\n  \n  // Signature and authentication\n  signature: string; // Base64 encoded signature image\n  rightThumbMark: string; // Base64 encoded thumb mark image\n  governmentIdNumber: string;\n  governmentIdIssuanceDate: string; // mm/dd/yyyy\n  dateAccomplished: string; // mm/dd/yyyy\n  passportSizePhoto: string; // Base64 encoded photo (4.5 cm x 3.5 cm)\n}\n\nexport interface PDSValidationError {\n  field: string;\n  message: string;\n  code: string;\n  severity: 'error' | 'warning';\n  suggestion?: string;\n}\n\nexport interface PDSValidationResult {\n  isValid: boolean;\n  errors: PDSValidationError[];\n  warnings: PDSValidationError[];\n  correctedData?: Partial<PDSData>;\n}