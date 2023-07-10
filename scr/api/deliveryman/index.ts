import { Router } from 'express';
import * as orderServices from 'src/services/order';

import { updateLocationSchema, orderDeliveredSchema, statsSchema, declineOrderSchema } from './schema';
import validator from 'src/middlewares/validator';
import * as deliveryManServices from 'src/services/deliveryMan';
import * as notifications from 'src/services/notifications';
import { OrderStatus } from 'src/enums/OrderStatus.enum';
import { generateDeliveryCode } from 'src/services/validationCodes';
import { orderNotFound } from 'src/utils/errors';

const router = Router();

router.post('/location', updateLocationSchema, validator, async (req: any, res, next) => {
  try {
    const { location } = req.body.payload;

    const serviceResponse = await deliveryManServices.setLocation({ uid: req.token.uid, location });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

/* 
TODO :
  1. Limit delivery man to take only one order at a time
  2. Check if order is already taken by another delivery
  3. Check if order is already delivered
  4. Check if order is already cancelled
  5. Check if order is already expired
*/
router.post('/takeOrder', async (req, res, next) => {
  const { orderId, code, shopId } = req.body.payload;
  try {
    const deliveryManId = req.token.uid;

    // const deliveryManHasOrder = await orderServices.deliveryManHasOrder({ deliveryManId });

    // if (deliveryManHasOrder) {
    //   throw new Error('You already have an order');
    // }

    const order = await orderServices.getOrderByShop({ orderId, shopId });

    if (!order) {
      throw orderNotFound;
    }

    await orderServices.deliveryManTakeOrder({ order, code, deliveryManId: req.token.uid, shopId });
    await orderServices.sendOrderTakenNotification(orderId, shopId);

    notifications.sendStatusUpdateToCustomer({ order, newStatus: OrderStatus.DELIVERY_STARTING });

    const allShopsOrdersTaken = await orderServices.allShopsOrdersTaken(order.orderNumber);

    if (allShopsOrdersTaken) {
      await generateDeliveryCode(order.orderNumber);
      await orderServices.setOrderReward({ order, deliveryManId });
    }

    return res.json({ payload: { order } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/declineOrder', declineOrderSchema, async (req, res, next) => {
  try {
    const { orderId } = req.body.payload;
    const deliveryManId = req.token.uid;
    const deliveryMan = await deliveryManServices.getDeliveryMan({ userId: deliveryManId });

    if (!deliveryMan) {
      throw Error('No delivery man found');
    }

    await orderServices.declineOrder({ orderId, deliveryManId });

    const orders = await orderServices.getOrdersAroundOfDeliveryMan(deliveryMan, [orderId]);
    await notifications.sendOrderToDeliveryMan({ orders, deliveryManSocketId: deliveryMan.socketId });

    return res.json({ payload: { status: 'success' } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/deliveredOrder', orderDeliveredSchema, validator, async (req, res, next) => {
  const { orderNumber, validationCode, customerId } = req.body.payload;
  try {
    const order = await orderServices.delivered({ orderNumber, validationCode, userId: customerId, deliveryManId: req.token.uid });

    return res.json({ payload: { order } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/current-order', async (req, res, next) => {
  try {
    const { uid } = req.token;
    const order = await orderServices.getDeliveryManCurrentOrderData({ deliveryManId: uid });

    return res.json({ payload: { order } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/stats', statsSchema, validator, async (req, res, next) => {
  const { month, year } = req.body.payload;
  try {
    const { uid } = req.token;
    const stats = await orderServices.getDeliveryManStats({ deliveryManId: uid, month, year });

    return res.json({ payload: { stats } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/last-day-orders', async (req, res, next) => {
  try {
    const { uid } = req.token;
    const orders = await orderServices.getLastDayDeliveryManOrders({ deliveryManId: uid });

    return res.json({ payload: { orders } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/last-month-orders', async (req, res, next) => {
  try {
    const { uid } = req.token;
    const orders = await orderServices.getLastMonthDeliveryManOrders({ deliveryManId: uid });

    return res.json({ payload: { orders } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
