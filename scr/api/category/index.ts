import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as categoryServices from 'src/services/category';
import * as productServices from 'src/services/product';

import { categoryProductSchema } from './schema';

const router = Router();

router.get('/', validator, async (req, res, next) => {
  try {
    const categories = await categoryServices.getAll();

    return res.json({ payload: { categories } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/products/:categoryId', categoryProductSchema, validator, async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const products = await productServices.getProductsByCategoryId({ categoryId });

    return res.json({ payload: { products } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:shopId', validator, async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const categories = await categoryServices.getUsedCategoriesByShopId({ shopId });

    return res.json({ payload: { categories } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:shopId/:categoryId', validator, async (req, res, next) => {
  try {
    const { shopId, categoryId } = req.params;

    const category = await categoryServices.getCategoryFromShop({ shopId, categoryId });

    return res.json({ payload: { category } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
