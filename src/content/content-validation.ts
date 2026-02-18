import * as Joi from 'joi';
import { BadRequestException } from '@nestjs/common';

const serviceItemSchema = Joi.object({
  id: Joi.string().optional().allow(''),
  name: Joi.string().required().max(200),
  price: Joi.string().required().max(50),
  description: Joi.string().required().max(1000),
  image: Joi.string().optional().allow('').max(2000),
}).unknown(true);

const reviewItemSchema = Joi.object({
  text: Joi.string().required().max(2000),
  author: Joi.string().required().max(200),
  rating: Joi.number().min(1).max(5).integer().required(),
}).unknown(true);

const contactSchema = Joi.object()
  .pattern(Joi.string(), Joi.string().max(500))
  .optional();

export const contentUpdateSchema = Joi.object({
  salonName: Joi.string().optional().allow('').max(200),
  tagline: Joi.string().optional().allow('').max(300),
  heroImage: Joi.string().optional().allow('').max(2000),
  about: Joi.string().optional().allow('').max(5000),
  services: Joi.array().items(serviceItemSchema).optional(),
  reviews: Joi.array().items(reviewItemSchema).optional(),
  contact: contactSchema,
  gallery: Joi.any().strip(), // not updatable via API; strip if sent
})
  .unknown(true); // allow other keys (e.g. future fields) to pass through

/**
 * Validates content update payload. Throws BadRequestException with message if invalid.
 * Returns the validated (and possibly transformed) object.
 */
export function validateContentUpdate(
  payload: unknown,
): Record<string, unknown> {
  const { error, value } = contentUpdateSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: false,
    convert: true, // e.g. "5" -> 5 for rating
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    throw new BadRequestException(`Content validation failed: ${messages}`);
  }

  return value as Record<string, unknown>;
}
