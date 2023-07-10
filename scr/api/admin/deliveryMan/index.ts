import { Router } from 'express';
import * as deliveryManServices from 'src/services/deliveryMan';

const router = Router();

router.get('/aroundShop', async (req: any, res, next) => {
  try {
    const { shopId } = req;
    const serviceResponse = await deliveryManServices.countAroundShop({ shopId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
