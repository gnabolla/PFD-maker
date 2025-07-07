import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '@/utils/logger';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed', {
        path: req.path,
        method: req.method,
        errors: validationErrors
      });

      res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
      return;
    }

    next();
  };
};

// Authentication validation schemas
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'any.required': 'Last name is required'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'New password is required'
    })
});

// PDS validation schemas
export const addressSchema = Joi.object({
  houseBlockLotNumber: Joi.string().required(),
  street: Joi.string().required(),
  subdivisionVillage: Joi.string().required(),
  barangay: Joi.string().required(),
  cityMunicipality: Joi.string().required(),
  province: Joi.string().required(),
  zipCode: Joi.string().pattern(/^\d{4}$/).required().messages({
    'string.pattern.base': 'ZIP code must be exactly 4 digits'
  })
});

export const createPDSSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  surname: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.min': 'Surname must be at least 2 characters long',
      'string.max': 'Surname cannot exceed 50 characters',
      'string.pattern.base': 'Surname can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Surname is required'
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'First name is required'
    }),
  middleName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .required()
    .messages({
      'string.min': 'Middle name must be at least 2 characters long',
      'string.max': 'Middle name cannot exceed 50 characters',
      'string.pattern.base': 'Middle name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Middle name is required'
    }),
  nameExtension: Joi.string()
    .max(10)
    .pattern(/^[a-zA-Z\s\.]+$/)
    .optional()
    .messages({
      'string.max': 'Name extension cannot exceed 10 characters',
      'string.pattern.base': 'Name extension can only contain letters, spaces, and periods'
    }),
  dateOfBirth: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date of birth must be in MM/DD/YYYY format',
      'any.required': 'Date of birth is required'
    }),
  placeOfBirth: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Place of birth must be at least 2 characters long',
      'string.max': 'Place of birth cannot exceed 100 characters',
      'any.required': 'Place of birth is required'
    }),
  civilStatus: Joi.string()
    .valid('Single', 'Married', 'Widowed', 'Separated', 'Others')
    .required()
    .messages({
      'any.only': 'Civil status must be one of: Single, Married, Widowed, Separated, Others',
      'any.required': 'Civil status is required'
    }),
  civilStatusDetails: Joi.string()
    .max(50)
    .when('civilStatus', {
      is: 'Others',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.max': 'Civil status details cannot exceed 50 characters',
      'any.required': 'Civil status details are required when "Others" is selected'
    }),
  height: Joi.string()
    .pattern(/^\d+(\.\d{1,2})? m$/)
    .required()
    .messages({
      'string.pattern.base': 'Height must be in format "X.XX m" (e.g., "1.75 m")',
      'any.required': 'Height is required'
    }),
  weight: Joi.string()
    .pattern(/^\d+(\.\d{1,2})? kg$/)
    .required()
    .messages({
      'string.pattern.base': 'Weight must be in format "XX.X kg" (e.g., "65.5 kg")',
      'any.required': 'Weight is required'
    }),
  bloodType: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .required()
    .messages({
      'any.only': 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-',
      'any.required': 'Blood type is required'
    }),
  citizenship: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Citizenship must be at least 2 characters long',
      'string.max': 'Citizenship cannot exceed 50 characters',
      'any.required': 'Citizenship is required'
    }),
  gsisId: Joi.string()
    .pattern(/^\d{11}$/)
    .optional()
    .messages({
      'string.pattern.base': 'GSIS ID must be exactly 11 digits'
    }),
  pagibigId: Joi.string()
    .pattern(/^\d{12}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Pag-IBIG ID must be exactly 12 digits'
    }),
  philhealthId: Joi.string()
    .pattern(/^\d{12}$/)
    .optional()
    .messages({
      'string.pattern.base': 'PhilHealth ID must be exactly 12 digits'
    }),
  sssId: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'SSS ID must be exactly 10 digits'
    }),
  tinId: Joi.string()
    .pattern(/^\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'TIN must be exactly 9 digits'
    }),
  residentialAddress: addressSchema.required(),
  permanentAddress: addressSchema.required(),
  father: Joi.object({
    surname: Joi.string().min(2).max(50).required(),
    firstName: Joi.string().min(2).max(50).required(),
    middleName: Joi.string().min(2).max(50).required(),
    nameExtension: Joi.string().max(10).optional()
  }).required(),
  mother: Joi.object({
    maidenName: Joi.string().min(2).max(50).required(),
    surname: Joi.string().min(2).max(50).required(),
    firstName: Joi.string().min(2).max(50).required(),
    middleName: Joi.string().min(2).max(50).required()
  }).required()
});

export const updatePDSSchema = createPDSSchema.fork(
  ['title', 'surname', 'firstName', 'middleName', 'dateOfBirth', 'placeOfBirth', 'civilStatus', 'height', 'weight', 'bloodType', 'citizenship', 'residentialAddress', 'permanentAddress', 'father', 'mother'],
  (schema) => schema.optional()
);