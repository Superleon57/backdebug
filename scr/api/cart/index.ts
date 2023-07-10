import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as cartServices from 'src/services/cart';
import * as productService from 'src/services/product';

import { cartSchema, deleteItemSchema } from './schema';
import { invalidVariantId, noVariantId, onlyOneShopAtATime, productNotAvailable, variantOutOfStock } from 'src/utils/errors';

const router = Router();

router.get('/', async (req: any, res, next) => {
  try {
    const userId = req.token.uid;
    const cart = await cartServices.getCart({ userId });

    if (!cart) {
      return res.json({ payload: { cart: { items: [] } } }).status(200);
    }

    if (cart.numberOfItems === 0) {
      return res.json({ payload: { cart: { items: [] } } }).status(200);
    }

    const data = await cartServices.getCartWithFees(cart);

    return res.json({ payload: data }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/addToCart', cartSchema, validator, async (req, res, next) => {
  const { productId, variantId } = req.body.payload;
  const userId = req.token.uid;
  try {
    const cart = await cartServices.getCart({ userId });
    const product = await productService.getProductById({ productId });

    const isFromDifferentShop = await cartServices.isFromDifferentShop({ cart, product });

    if (product.hidden || product.archived) {
      throw productNotAvailable;
    }

    if (isFromDifferentShop) {
      throw onlyOneShopAtATime;
    }

    if (product.hasVariants && !variantId) {
      throw noVariantId;
    }

    if (product.hasVariants) {
      const variant = product.Variants.find(v => v.id === variantId);

      if (!variant) {
        throw invalidVariantId;
      }

      if (variant.quantity === 0) {
        throw variantOutOfStock;
      }
    }

    await cartServices.addToCart({ cart, product, variantId });

    if (!cart.distance) {
      await cartServices.setDistance({ userId });
    }

    return res.json({ payload: { status: 'success' } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/delete', deleteItemSchema, validator, async (req, res, next) => {
  const { productId, quantity, variantId } = req.body.payload;
  try {
    await cartServices.deleteItemFromCart({ productId, quantity, variantId, userId: req.token.uid });

    return res.json({ payload: { status: 'success' } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/clear', async (req: any, res, next) => {
  try {
    const serviceResponse = await cartServices.clearCart({ userId: req.token.uid });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/insurance', async (req: any, res, next) => {
  try {
    const { status } = req.body.payload;
    const cart = await cartServices.getCart({ userId: req.token.uid });
    await cartServices.handleReturnInsurance({ cart, status });

    return res.json({ payload: { status: 'success' } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
