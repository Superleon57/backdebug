import { Router } from 'express';

import * as orderServices from 'src/services/order';
import * as cartServices from 'src/services/cart';
import * as userServices from 'src/services/user';
import * as shopServices from 'src/services/shop';
import * as deliveryManServices from 'src/services/deliveryMan';
import { isOrderOwner } from 'src/middlewares/orders';

import validator from 'src/middlewares/validator';

import { orderValidationCodeSchema, locationSchema, confirmSchema, orderInfoSchema } from './schema';
import { getDeliveryCode } from 'src/services/validationCodes';
import { getDistance } from 'src/services/maps';
import { PaymentResult } from 'src/enums/PaymentResult.enum';
import { OrderStatus } from 'src/enums/OrderStatus.enum';
import { calculateShippingFees, getFormatedCartItems } from 'src/services/cart';
import { Order } from 'src/entities/order';
import { Shop } from 'src/entities/shop';
import { OrderItem } from 'src/entities/item';

const router = Router();

router.get('/validationCode/:orderNumber', orderValidationCodeSchema, validator, isOrderOwner, async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.token.uid;

    const orders = await orderServices.getOrdersByOrderNumber(orderNumber);

    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    if (order.userId !== userId) {
      throw new Error('You are not the owner of this order');
    }

    const deliveryCode = await getDeliveryCode({ orderNumber });

    return res.json({ payload: { deliveryCode } }).status(200);
  } catch (error) {
    return next(error);
  }
});

/* 
  TODO:
  - Disable when order is delivered
*/
router.get('/location/:orderNumber', locationSchema, validator, isOrderOwner, async (req: any, res, next) => {
  try {
    const { orderNumber } = req.params;

    const orders = await orderServices.getOrdersByOrderNumber(orderNumber);

    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    const shopIds = orders.map(order => order.shopId);

    const shops = await shopServices.getShopsPublicInfo(shopIds);

    const ordersWithItemsPromises = orders.map(async order => {
      const items = await orderServices.getFormatedOrderItems({ orderId: order.id });
      const shop = shops.find(shop => shop.id === order.shopId);
      delete shop.openingTimes;
      return { ...order, items, shop };
    });

    const ordersWithItemsAndShops = await Promise.all(ordersWithItemsPromises);

    const deliveryMan = order?.deliveryManId ? await deliveryManServices.getDeliveryMan({ userId: order?.deliveryManId }) : null;

    const data: any = {
      orderNumber,
      ordersWithItemsAndShops,
      creationDate: order.creationDate,
    };

    if (deliveryMan) {
      data.deliveryManDistance = await getDistance(deliveryMan.localisation, order.deliveryAddress.position);
      data.deliveryMan = order.deliveryManId;

      const deliveryCode = await getDeliveryCode({ orderNumber });
      data.code = deliveryCode?.code;
    }

    return res.json({ payload: data }).status(200);
  } catch (error) {
    return next(error);
  }
});

type OrderWithData = Order & {
  items: OrderItem[];
  shop: Omit<Shop, 'openingTimes'>;
  deliveryManDistance: {
    distance: string;
    duration: string;
    distanceValue: number;
  };
};

router.get('/list', async (req: any, res, next) => {
  try {
    const { uid } = req.token;

    const orders = await orderServices.getUserOrders({ userId: uid });

    const shopIds = orders.map(order => order.shopId);
    const shops = await shopServices.getShopsPublicInfo(shopIds);

    const ordersWithData = await Promise.all(
      orders.map(async order => {
        const shop = shops.find(shop => shop.id === order.shopId);

        const orderWithData = { ...order, shop: { ...shop, openingTimes: undefined } };

        if (order.status !== OrderStatus.CANCELED && order.status !== OrderStatus.DELIVERED) {
          const deliveryMan = await deliveryManServices.getDeliveryManByOrderNumber(order.orderNumber);

          if (deliveryMan) {
            orderWithData.deliveryManDistance = await getDistance(deliveryMan.localisation, order.deliveryAddress.position);
          }
        }

        const items = await orderServices.getOrderItems({ orderId: order.id });

        orderWithData.items = items;

        return orderWithData;
      })
    );

    return res.json({ payload: ordersWithData }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:orderNumber', orderInfoSchema, validator, isOrderOwner, async (req: any, res, next) => {
  try {
    const { uid } = req.token;
    const { orderNumber } = req.params;

    const order = await orderServices.getOrdersByOrderNumber(orderNumber);

    return res.json({ payload: order }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
