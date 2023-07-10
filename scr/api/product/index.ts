import { Router } from 'express';
import * as productService from 'src/services/product';

import validator from 'src/middlewares/validator';
import { productSchema, productsSchema, multiProductsSchema, serachSchema } from './schema';

const router = Router();

router.get('/shop/:shopId', productsSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const products = await productService.getProducts({ shopId });
    return res.json({ payload: { products } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:productId', productSchema, validator, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await productService.getProductById({ productId });

    return res.json({ payload: product }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/multi', multiProductsSchema, validator, async (req, res, next) => {
  try {
    const { productsIds } = req.body.payload;

    const products = await productService.getProductsByIds({ productsIds });

    return res.json({ payload: { products } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/search', serachSchema, validator, async (req, res, next) => {
  try {
    const { query, shopId, categoryId, page, hitsPerPage, position } = req.body.payload;

    const products = await productService.search({ query, shopId, categoryId, page, hitsPerPage, position });

    return res.json({ payload: products }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
