import Joi from 'joi';

export const addContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(3).max(20).required(),
  contactType: Joi.string().valid('personal', 'business').optional(),
  isFavourite: Joi.boolean().optional(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(3).max(20).optional(),
  contactType: Joi.string().valid('personal', 'business').optional(),
  isFavourite: Joi.boolean().optional(),
}).min(1);
