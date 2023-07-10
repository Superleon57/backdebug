import { body } from 'express-validator';

export const signinSchema = [body('payload.email').isEmail().trim(), body('payload.password').isString()];

export const userSignupSchema = [
  body('payload.email').isEmail().trim(),
  body('payload.password').optional().isString(),
  body('payload.lastName').isString().trim(),
  body('payload.firstName').isString().trim(),
];

export const userDeleteSchema = [
  body('payload.uid').trim(),
];
