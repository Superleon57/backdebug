import { body, check, header, param } from 'express-validator';

export const shopHeaderSchema = [header('shop').isString().notEmpty().trim()];
