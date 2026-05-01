const Joi = require('joi');

// Base validation schema for all user types
const baseUserSchema = {
  fullName: Joi.string().trim().min(2).required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters',
      'any.required': 'Full name is required'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  phone: Joi.string().trim().pattern(/^\+?[\d\s\-]{10,}$/).required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required'
    }),
  password: Joi.string().min(8).pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
      'any.required': 'Password is required'
    }),
  address: Joi.string().trim().min(10).required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters',
      'any.required': 'Address is required'
    })
};

// Donor validation schema
const donorSchema = Joi.object({
  ...baseUserSchema
});

// Individual validation schema
const individualSchema = Joi.object({
  ...baseUserSchema,
  // Optional ID number for individuals
  idNumber: Joi.string().allow('', null)
});

// NGO validation schema
const ngoSchema = Joi.object({
  ...baseUserSchema,
  registrationNumber: Joi.string().trim()
    .pattern(/^NGO.{3,}$/)
    .required()
    .messages({
      'string.empty': 'Registration number is required',
      'string.pattern.base': 'Registration number must start with "NGO" and have at least 6 characters',
      'any.required': 'Registration number is required'
    })
});

// Validation middleware functions
const validateDonor = (req, res, next) => {
  const { error } = donorSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      const key = curr.path[0];
      acc[key] = curr.message;
      return acc;
    }, {});
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

const validateIndividual = (req, res, next) => {
  const { error } = individualSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      const key = curr.path[0];
      acc[key] = curr.message;
      return acc;
    }, {});
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

const validateNGO = (req, res, next) => {
  const { error } = ngoSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      const key = curr.path[0];
      acc[key] = curr.message;
      return acc;
    }, {});
    
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

module.exports = {
  validateDonor,
  validateIndividual,
  validateNGO
};