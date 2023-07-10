import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as shopServices from 'src/services/shop';
import * as feesServices from 'src/services/fees';
import { feesSchema, shopFeesSchema, updateShopStatusSchema, updateShopFeesSchema } from './schema';

const router = Router();

/* 
  Todo:
  - Add a middleware to check if the user is a supervisor
*/

router.get('/shops', validator, async (req, res, next) => {
  try {
    const serviceResponse = await shopServices.getAll();

    return res.json({ shops: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/shop/updateStatus', updateShopStatusSchema, validator, async (req, res, next) => {
  try {
    const { shopId, disabled } = req.body.payload;

    if (disabled === false) {
      await shopServices.shopCanBeEnabled({ shopId });
    }

    const serviceResponse = await shopServices.updateShopStatus({ shopId, disabled });

    return res.json({ payload: { id: shopId, ...serviceResponse } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/fees', validator, async (req, res, next) => {
  try {
    const serviceResponse = await feesServices.getFees();

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});
router.get('/fees/:shopId', shopFeesSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const shop = await shopServices.getShop({ shopId });

    if (!shop) {
      throw new Error('Shop not found');
    }

    const shopFees = await feesServices.getShopFees({ shopId });

    return res
      .json({
        payload: {
          shop,
          fees: shopFees,
        },
      })
      .status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/fees', feesSchema, validator, async (req, res, next) => {
  try {
    const { fees } = req.body.payload;
    const serviceResponse = await feesServices.updateFees({ fees });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/shop-fees', updateShopFeesSchema, validator, async (req, res, next) => {
  try {
    const { shopId, fees } = req.body.payload;
    const shop = await shopServices.getShop({ shopId });

    if (!shop) {
      throw new Error('Shop not found');
    }

    const serviceResponse = await feesServices.updateShopFees({ fees, shopId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
