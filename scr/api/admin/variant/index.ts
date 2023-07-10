import { Router } from 'express';
import * as variantService from 'src/services/variant';
import * as productService from 'src/services/product';

import validator from 'src/middlewares/validator';
import { removeVariantSchema } from './schema';
import { productNotFound, forbiddenActionException } from 'src/utils/errors';

const router = Router();

router.delete('/', removeVariantSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { productId, variantId } = req.body.payload;

    const product = await productService.getProductById({ productId });

    if (!product) {
      throw productNotFound;
    }

    if (product.shopId !== shopId) {
      throw forbiddenActionException;
    }

    const updatedProduct = await variantService.removeVariant({ productId, variantId });

    return res.json({ payload: { product: updatedProduct } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
