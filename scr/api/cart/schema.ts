import { body } from 'express-validator';

export const cartSchema = [
  body('payload.productId').isString().notEmpty().trim(),
  body('payload.variantId').isString().optional().trim(),
];
export const deleteItemSchema = [...cartSchema, body('payload.quantity').isNumeric()];
