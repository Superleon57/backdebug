import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as orderServices from 'src/services/order';
import * as productService from 'src/services/product';
import * as orderItemsService from 'src/services/orderItems';
import { getTakingCode } from 'src/services/validationCodes';
import { generateTakingCode } from 'src/services/validationCodes';

import { cancelOrderSchema, holdOrderSchema, orderNextStepSchema, orderSchema } from './schema';

import { isOrderedFromShop } from 'src/middlewares/orders';
import { OrderStatus } from 'src/enums/OrderStatus.enum';

const router = Router();

router.post('/', orderSchema, validator, async (req, res, next) => {
  const { shopId } = req;

  const { page, hitsPerPage, status } = req.body.payload;
  try {
    const orders = await orderServices.getOrdersWithUserInfo({ shopId, page, hitsPerPage, status });

    return res.json({ payload: orders }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/processing', orderSchema, validator, async (req, res, next) => {
  const { shopId } = req;
  const { page, hitsPerPage } = req.body.payload;

  try {
    const orders = await orderServices.getInProgressOrders({ shopId, page, hitsPerPage });

    return res.json({ payload: orders }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/delivered', orderSchema, validator, async (req, res, next) => {
  const { shopId } = req;
  const { page, hitsPerPage } = req.body.payload;

  try {
    const orders = await orderServices.getDeliveredOrders({ shopId, page, hitsPerPage });

    return res.json({ payload: orders }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/items/:orderId', async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const items = await orderServices.getOrderItems({ orderId });

    await Promise.all(
      items.map(async item => {
        item.detail = await productService.getProductById({ productId: item.productId });
        return item;
      })
    );

    return res.json({ payload: { items } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/nextStep', orderNextStepSchema, validator, async (req, res, next) => {
  const { shopId } = req;
  const { orderId, itemsToCancel } = req.body.payload;
  try {
    await orderItemsService.cancelItems({ orderId, itemsToCancel });

    const order = await orderServices.orderValidation({ shopId, orderId });

    const code = await generateTakingCode(orderId);

    await orderServices.sendOrderToDeliveryMans({ order, shopId });

    return res.json({ payload: { order, code } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/hold', holdOrderSchema, validator, async (req, res, next) => {
  const { shopId } = req;
  const { orderId } = req.body.payload;
  try {
    const order = await orderServices.holdOrder({ orderId, shopId });

    return res.json({ payload: { order } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/cancel', cancelOrderSchema, validator, async (req, res, next) => {
  const { shopId } = req;
  const { orderId } = req.body.payload;
  try {
    const order = await orderServices.cancelOrder({ orderId, shopId });

    return res.json({ payload: { order } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/code/:orderId', isOrderedFromShop, async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const code = await getTakingCode({ orderId });

    return res.json({ payload: { code } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const { shopId } = req;

  try {
    const orders = await orderServices.getUserOrders({
      userId,
      filter: {
        shopId,
        limit: 5,
      },
    });

    return res.json({ payload: { orders } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
