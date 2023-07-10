import { param } from 'express-validator';

export const categorySchema = [param('shopId').isString().trim()];
export const categoryProductSchema = [param('categoryId').isString().trim()];
