import { Order } from 'src/entities/order';
import ioc from 'src/utils/iocContainer';
import * as shopService from 'src/services/shop';
import * as userService from 'src/services/user';
import { Shop } from 'src/entities/shop';

type Notification = {
  token: string;
  notification?: {
    title?: string;
    body?: string;
  };
  data?: object;
};

type sendNotificationParms = {
  token: string;
  title?: string;
  body?: string;
  data?: object;
};

export const sendNotification = async ({ title, body, token, data }: sendNotificationParms) => {
  const messaging = ioc.get('firebaseMessaging');

  const message: Notification = {
    data,
    token,
  };

  if (title) {
    message.notification = {
      title,
      body,
    };
  }

  messaging
    .send(message)
    .then(response => {
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.log('Error sending message:', error);
    });
};

export const newOrderNotification = (order: Order) => {
  const shopIds = Object.keys(order.shopsStatus);
  shopIds.forEach(async shopId => {
    const messagingToken = await shopService.getMessagingToken({ shopId });
    sendNotification({
      token: messagingToken,
      data: { action: 'newOrder', order: JSON.stringify(order) },
    });
  });
};

const orderStatusChangedNotification = async ({ order, shop, title, body }: { order: Order; shop: Shop; title: string; body: string }) => {
  const messagingToken = await userService.getMessagingToken(order.userId);
  sendNotification({
    token: messagingToken,
    title,
    body,
    data: { action: 'orderStatusChanged', order: JSON.stringify(order), shop: JSON.stringify(shop) },
  });
};

export const orderValidationNotification = async ({ order, shop }) => {
  orderStatusChangedNotification({
    order,
    shop,
    title: "Votre commande a été préparée, en attente d'un livreur.",
    body: 'Un livreur arrive pour prendre en charge votre commande!',
  });
};

export const orderHandledByDeliveryNotification = async ({ order, shop }) => {
  orderStatusChangedNotification({
    order,
    shop,
    title: 'Votre commande est en cours de livraison.',
    body: 'Votre commande est en cours de livraison.',
  });
};

export const orderAlmostArrivedNotification = async ({ order, shop }) => {
  orderStatusChangedNotification({
    order,
    shop,
    title: 'Votre commande arrive bientôt.',
    body: 'Votre commande arrive bientôt.',
  });
};

export const orderArrivedNotification = async ({ order, shop }) => {
  orderStatusChangedNotification({
    order,
    shop,
    title: 'Votre commande est arrivée.',
    body: 'Votre commande est arrivée.',
  });
};

export const orderDeliveredNotification = async ({ order, shop }) => {
  orderStatusChangedNotification({
    order,
    shop,
    title: 'Votre commande a été livrée.',
    body: 'Votre commande a été livrée.',
  });
};
