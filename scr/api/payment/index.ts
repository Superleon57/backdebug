import { Router } from 'express';

import * as paymentServices from 'src/services/payment';
import * as userServices from 'src/services/user';
import * as cartServices from 'src/services/cart';
import * as orderServices from 'src/services/order';
import * as productServices from 'src/services/product';
import { PaymentResult } from 'src/enums/PaymentResult.enum';

import { authorizedServer, isValidSignature } from 'src/middlewares/up2pay';

import validator from 'src/middlewares/validator';
import { payPageSchema, paymentSchema } from './schema';
import { calculateShippingFees, getFormatedCartItems } from 'src/services/cart';
import config from 'src/config';
import isAuth, { setTokenFromQuery } from 'src/middlewares/isAuth';
import getUser from 'src/middlewares/getUser';

const router = Router();

router.get('/callback', paymentSchema, validator, isValidSignature, async (req, res, next) => {
  try {
    const { uid, amount, ref, auto, error } = req.query;
    const userId = uid;

    const paymentResult = { amount, auto, error };

    if (error !== '00000') {
      orderServices.setOrderFailed({ orderNumber: ref, paymentResult });
      orderServices.sendPaymentNotification({ userId, paymentResult: PaymentResult.FAILED });
      throw new Error('Payment failed');
    }

    await orderServices.setOrderPaid({ orderNumber: ref, paymentResult });
    await cartServices.clearCart({ userId });

    orderServices.sendPaymentNotification({ userId, paymentResult: PaymentResult.SUCCESS, orderNumber: ref });
    return res.redirect('https://www.jaformations.fr/payment/accepte.html');
    //return res.status(200).json({ message: 'Payment success' });
  } catch (error) {
    return next(error);
  }
});

router.get('/confirm', payPageSchema, setTokenFromQuery, isAuth, getUser, async (req, res, next) => {
  try {
    const { currentUser } = req;

    if (!currentUser) {
      return res.status(401).render('unauthorized');
    }

    const userId = currentUser.id;

    const server = await paymentServices.getPaymentServer();

    if (!server) {
      return res.status(500).render('payment-server-unavailable');
    }

    const cart = await cartServices.getCart({ userId });

    const canBeDelivered = await cartServices.canBeDelivered({ cart });

    if (!canBeDelivered) {
      return res
        .status(400)
        .render('payment-cancel', { error: 'Le contenu de votre panier ne peut pas être livré (Distance ou prix hors périmètre).' });
    }

    const formatedCartItems = await getFormatedCartItems({ cart });

    const fees = await calculateShippingFees({
      cartItems: formatedCartItems,
      distanceInMetter: cart.distance.distanceValue,
    });

    const lastUpdatedPosition: any = await userServices.getUserLastLocation({ userId });

    const items = await cartServices.getCartItems({ cartId: cart?.id });

    const itemsAreAvailable = await productServices.allItemsAreAvailable({ items });

    if (!itemsAreAvailable) {
      return res.status(400).render('payment-cancel', { error: 'Certains articles ne sont plus en stock.' });
    }

    const createdOrder = await orderServices.createOrder({
      items,
      userId,
      deliveryAddress: lastUpdatedPosition,
      cart,
      fees,
    });

    const msgData = await paymentServices.getMsgData({ cart, fees, user: currentUser, orderNumber: createdOrder.orderNumber });

    const hmac = await paymentServices.getHmac(msgData);

    res.render('payment', { server, data: msgData, hmac });
  } catch (error) {
    console.log(error);
    return res.status(400).render('payment-cancel', { error: error.message });
  }
});

router.get('/success', async (req, res, next) => {
  try {
    res.render('payment-success');
  } catch (error) {
    return next(error);
  }
});

router.get('/error', async (req, res, next) => {
  try {
    res.render('payment-error');
  } catch (error) {
    return next(error);
  }
});

router.get('/cancel', async (req, res, next) => {
  try {
    res.render('payment-cancel');
  } catch (error) {
    return next(error);
  }
});

router.get('/confirm-test', isAuth, getUser, async (req, res, next) => {
  try {
    if (!config.IS_DEV_OR_IS_TEST) {
      return res.status(401).render('unauthorized');
    }

    const { currentUser } = req;

    if (!currentUser) {
      return res.status(401).render('unauthorized');
    }

    const userId = currentUser.id;

    const cart = await cartServices.getCart({ userId });

    const canBeDelivered = await cartServices.canBeDelivered({ cart });

    if (!canBeDelivered) {
      return res.status(400).json({ error: 'Le contenu de votre panier ne peut pas être livré (Distance ou prix hors périmètre).' });
    }

    const formatedCartItems = await getFormatedCartItems({ cart });

    const fees = await calculateShippingFees({
      cartItems: formatedCartItems,
      distanceInMetter: cart.distance.distanceValue,
    });

    const lastUpdatedPosition: any = await userServices.getUserLastLocation({ userId });

    const items = await cartServices.getCartItems({ cartId: cart?.id });

    const itemsAreAvailable = await productServices.allItemsAreAvailable({ items });

    if (!itemsAreAvailable) {
      return res.status(400).json({ error: 'Certains articles ne sont plus en stock.' });
    }

    const createdOrder = await orderServices.createOrder({
      items,
      userId,
      deliveryAddress: lastUpdatedPosition,
      cart,
      fees,
    });

    await orderServices.setOrderPaid({
      orderNumber: createdOrder.orderNumber,
      paymentResult: {
        amount: fees.totalPrice.toString(),
        auto: 'XXXXXX',
        error: '00000',
      },
    });
    await cartServices.clearCart({ userId });

    orderServices.sendPaymentNotification({ userId, paymentResult: PaymentResult.SUCCESS, orderNumber: createdOrder.orderNumber });

    return res.status(200).json({ message: 'Payment success' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
