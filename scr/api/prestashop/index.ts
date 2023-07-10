import { Router } from 'express';
import * as PrestaShopWebservice from 'src/services/prestashop';

import validator from 'src/middlewares/validator';
import { prestashopSchema } from './schema';

const router = Router();

router.get('/customers/:shopId', prestashopSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const customers = await PrestaShopWebservice.getCustomers({ shopId });
    return res.json({ payload: customers }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/customers/:shopId/:customerId', prestashopSchema, validator, async (req, res, next) => {
  try {
    const { shopId, customerId } = req.params;
    const customer = await PrestaShopWebservice.getCustomerById({ shopId, customerId });
    return res.json({ payload: customer }).status(200);
  } catch (error) {
    return next(error);
  }
});


export default router;
