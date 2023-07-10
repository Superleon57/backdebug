import { body} from 'express-validator';


export const removeVariantSchema = [
  body('payload.variantId').isString().notEmpty().trim(),
  body('payload.productId').isString().notEmpty().trim(),
];
