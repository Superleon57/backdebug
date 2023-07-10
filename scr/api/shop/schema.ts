import { body, header, param } from 'express-validator';
import { paginationSchema, positionSchema } from 'src/schemas/meilisearchSchema';

export const shopSchema = [
  body('payload.name').isString(),
  body('payload.description').isString(),
  body('payload.image').isString().trim(),
  body('payload.type').isString(),
  body('payload.localisation.latitude').isNumeric(),
  body('payload.localisation.longitude').isNumeric(),
  body('payload.addr1').isString(),
  body('payload.addr2').isString(),
  body('payload.cp').isString().trim(),
  body('payload.ville').isString(),
];

export const shopConfigSchema = [
  body('payload.shopId').isString().trim(),
  body('payload.newConfig.url').isString().trim(),
  body('payload.newConfig.api_key').isString().trim(),
  body('payload.newConfig.type').isString().trim(),
];

export const aroundSchema = [
  body('payload.latitude').isNumeric(),
  body('payload.longitude').isNumeric(),
  body('payload.distance').isInt({ min: 0, max: 5 }),
  ...paginationSchema,
];
export const searchSchema = [body('payload.query').isString(), ...positionSchema, ...paginationSchema];

export const shopOpeningTimeSchema = [];

export const shopInfoSchema = [param('shopId').isString().trim()];

export const registerSchema = [
  body('payload.shopName').isString(),
  body('payload.firstName').isString(),
  body('payload.lastName').isString(),
  body('payload.email').isEmail(),
  body('payload.password').isString().trim(),
];
