import { param, body } from 'express-validator';
import { paginationSchema, positionSchema } from 'src/schemas/meilisearchSchema';

export const productsSchema = [param('shopId').isString().trim()];
export const productSchema = [param('productId').isString().trim()];
export const multiProductsSchema = [body('payload.productsIds').isArray()];

export const serachSchema = [
  body('payload.query').isString(),
  body('payload.shopId').isString().optional().trim(),
  body('payload.categoryId').isString().optional().trim(),

  ...positionSchema,
  ...paginationSchema,
];
