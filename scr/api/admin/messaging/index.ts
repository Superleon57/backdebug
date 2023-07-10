import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as orderServices from 'src/services/order';

import { updateMessagingSchema } from './schema';

const router = Router();

router.patch('/', updateMessagingSchema, validator, async (req, res, next) => {
  const { shopId } = req;
  const { token } = req.body.payload;
  try {
    const orders = await orderServices.getOrders({ shopId });

    return res.json({ payload: orders }).status(200);
  } catch (error) {
    return next(error);
  }
});
