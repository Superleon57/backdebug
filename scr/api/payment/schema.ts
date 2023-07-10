import { body, query } from 'express-validator';

export const paymentSchema = [
  query('uid').isString(),
  query('amount').isString(),
  query('ref').isString(),
  query('auto').isString(),
  query('error').isString(),
  query('sign').isString(),
];

export const payPageSchema = [query('token').isString()];
