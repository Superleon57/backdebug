import { body } from 'express-validator';

export const updateLocationSchema = [body('payload.location').isArray({ min: 2, max: 2 })];
export const orderDeliveredSchema = [
  body('payload.orderNumber').isNumeric(),
  body('payload.validationCode').isNumeric(),
  body('payload.customerId').isString(),
];

export const statsSchema = [
  body('payload.month')
    .isString()
    .matches(/^(0?[1-9]|1[012])$/)
    .withMessage('Le mois doit être un nombre entre 01 et 12.'),
  body('payload.year')
    .isString()
    .matches(/^(19|20)\d{2}$/)
    .withMessage("L'année doit être un nombre valide (format: YYYY)."),
];

export const declineOrderSchema = [body('payload.orderId').isString().trim()];
