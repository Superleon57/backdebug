import { param } from 'express-validator';

export const prestashopSchema = [param('shopId').isString().trim()];
