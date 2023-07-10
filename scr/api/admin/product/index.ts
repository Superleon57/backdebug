import { Router } from 'express';
import * as productService from 'src/services/product';
import * as shopService from 'src/services/shop';

import validator from 'src/middlewares/validator';
import { productIdsListSchema, productSchema, productsSchema, updateProductSchema } from './schema';

const router = Router();

router.get('/', productsSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const products = await productService.getShopProducts({ shopId });

    return res.json({ payload: { products } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:productId', productsSchema, validator, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await productService.getProductById({ productId });

    return res.json({ payload: { product } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/new', productSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;

    const newProduct = await productService.create({ shopId, product: req.body.payload });

    return res.json({ payload: { product: newProduct } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/hide', productIdsListSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { productIds } = req.body.payload;

    const updatedProducts = await productService.hideProducts({ shopId, productIds });

    return res.json({ payload: { updatedProducts } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/unhide', productIdsListSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { productIds } = req.body.payload;

    const updatedProducts = await productService.unhideProducts({ shopId, productIds });

    return res.json({ payload: { updatedProducts } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/delete', productIdsListSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { productIds } = req.body.payload;

    const deletedProducts = await productService.deleteProducts({ shopId, productIds });

    return res.json({ payload: { deletedProducts } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:productId', updateProductSchema, validator, async (req, res, next) => {
  try {
    const { productId } = req.params;

    await productService.isProductShopOwner({ productId, shopId: req.shopId });

    const updatedProduct = await productService.update({ productId, newData: req.body.payload });

    return res.json({ payload: { product: updatedProduct } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
