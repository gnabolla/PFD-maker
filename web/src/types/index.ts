export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  nameExtension?: string;
  dateOfBirth: string;
  placeOfBirth: string;
  sex: string;
  civilStatus: string;
  height: string;
  weight: string;
  bloodType: string;
  gsisId?: string;
  pagibigId?: string;
  philhealthId?: string;
  sssId?: string;
  tinId?: string;
  agencyEmployeeNumber?: string;
  citizenship: string;
  dualCitizenship?: string;
  country?: string;
  residentialAddress?: Address;
  permanentAddress?: Address;
  telephoneNumber?: string;
  mobileNumber?: string;
  emailAddress?: string;
}

export interface Address {
  houseNumber: string;
  street: string;
  subdivision?: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
}

export interface PDS {
  id: string;
  userId: string;
  status: 'draft' | 'completed' | 'validated';
  personalInfo?: PersonalInfo;
  familyBackground?: any;
  educationalBackground?: any[];
  civilService?: any[];
  workExperience?: any[];
  voluntaryWork?: any[];
  trainingPrograms?: any[];
  specialSkills?: any[];
  recognition?: any[];
  membership?: any[];
  references?: any[];
  questionsAnswers?: any;
  fullData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}
