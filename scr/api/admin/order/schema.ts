import { body } from 'express-validator';

export const orderSchema = [
  body('payload.page').isInt().optional().default(1),
  body('payload.hitsPerPage').optional({ checkFalsy: true }).isInt().default(5),
  body('payload.status').optional({ checkFalsy: true }).isString().trim(),
];

export const holdOrderSchema = [body('payload.orderId').isString().trim()];

export const orderNextStepSchema = [
  body('payload.orderId').isString().trim(),
  body('payload.itemsToCancel').isArray().withMessage('itemsToCancel must be an array'),
  body('payload.itemsToCancel.*.id').isString().trim(),
  body('payload.itemsToCancel.*.quantity').isInt({ min: 0 }),
];

export const cancelOrderSchema = [body('payload.orderId').isString().trim()];
