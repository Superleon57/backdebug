import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as statisticsServices from 'src/services/statistics';
import * as productsServices from 'src/services/product';

import { statisticsSchema } from './schema';
import isShopAdmin from 'src/middlewares/isShopAdmin';

const router = Router();

router.post('/', statisticsSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;

    const sales = await statisticsServices.getStatistics({ shopId });

    return res.json({ payload: { sales } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/day', statisticsSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req.body.payload;
    const serviceResponse = await statisticsServices.getDailyIncome({ shopId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/month', statisticsSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req.body.payload;
    const serviceResponse = await statisticsServices.getMonthlyIncome({ shopId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/top-ten-sales', async (req, res, next) => {
  try {
    const { shopId } = req;
    const topTenSales = await productsServices.getTopTenSalesProducts({ shopId });

    return res.json({ payload: topTenSales }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
