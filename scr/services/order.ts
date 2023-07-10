import * as orderRepository from 'src/repositories/order';
import * as userService from 'src/services/user';
import * as shopService from 'src/services/shop';
import * as productService from 'src/services/product';
import * as deliveryManService from 'src/services/deliveryMan';

import { OrderStatus } from 'src/enums/OrderStatus.enum';
import { OrderEmits } from 'src/enums/OrderEvents.enum';
import { PaymentResult } from 'src/enums/PaymentResult.enum';

import ioc from 'src/utils/iocContainer';
import { Order } from 'src/entities/order';
import * as notifications from './notifications';
import { deliveryCodeIsValid, takingCodeIsValid } from './validationCodes';

import { getDistance } from 'src/services/maps';
import { user } from 'src/entities/user';
import { calculateReward } from 'src/utils/rewards';
import { incrementSaleForOrder } from './Sales';
import { getShopFees } from './fees';
import { Cart } from 'src/entities/cart';
import { CalculatedFees } from 'src/entities/Fees';
import { Item } from 'src/entities/item';
import * as MeiliSearch from 'src/services/meilisearch';
import config from 'src/config';
import { DeliveryMan } from 'src/entities/deliveryMan';
import { getDeliveryLevel } from './cart';

type CreateOrderParams = {
  userId: string;
  deliveryAddress: any;
  items: Item[];
  cart: Cart;
  fees: CalculatedFees;
};

export const createOrder = async ({ items, userId, deliveryAddress, cart, fees }: CreateOrderParams) => {
  try {
    await canOrder({ cart });

    const shopId = cart.shopId;
    const shop = await shopService.getShop({ shopId });

    const newOrder = await orderRepository.createOrder({ items, userId, deliveryAddress, cart, fees, shop });
    // newOrderNotification(newOrder);

    return newOrder;
  } catch (err) {
    throw err;
  }
};

export const canOrder = async ({ cart }: { cart: Cart }) => {
  const shopFees = await getShopFees({ shopId: cart.shopId });
  const distance = cart.distance;

  if (!distance) {
    throw new Error('Distance not found');
  }

  const { customerFees } = shopFees;
  const distanceInKm = distance.distanceValue / 1000;

  const deliveryLevel = getDeliveryLevel(customerFees, distanceInKm, cart.subTotal);

  if (deliveryLevel === undefined) {
    throw new Error('Delivery not possible');
  }

  return true;
};

export const setOrderPaid = async ({ orderNumber, paymentResult }) => {
  try {
    await orderRepository.setOrdersPaid({ orderNumber, paymentResult });

    const orders = await getOrdersByOrderNumber(orderNumber);

    for (const order of orders) {
      await incrementSaleForOrder(order.id);
    }

    await sendNewOrderNotificationToShop(orderNumber);
  } catch (err) {
    throw err;
  }
};

export const getOrder = async ({ orderId }) => {
  return await orderRepository.findOneById({ orderId });
};

export const getOrderByOrderNumber = async (orderNumber: string) => {
  return (await orderRepository.findOneByOrderNumber(orderNumber)) as Order;
};

export const getOrdersByOrderNumber = async (orderNumber: string) => {
  return await orderRepository.findManyByOrderNumber(orderNumber);
};

export const isOrderOwner = async ({ orderNumber, userId }: { orderNumber: string; userId: string }) => {
  const orderOwnerId = await orderRepository.getOrderOwnerId({ orderNumber });
  return orderOwnerId === userId;
};

export const isOrderedFromShop = async ({ orderId, shopId }) => {
  const order = await getOrder({ orderId });
  return order?.shopId === shopId;
};

export const getOrderByShop = async ({ shopId, orderId }) => {
  return await orderRepository.findOneByShop({ orderId, shopId });
};

const concatUsersToOrders = async (orders: Order[]) => {
  const usersIdsSet = new Set();
  orders.forEach(order => {
    usersIdsSet.add(order.userId);
  });

  const usersIds = Array.from(usersIdsSet) as string[];

  const users = usersIds.map(userId => userService.getUserByUid(userId));
  const usersInfo = await Promise.all(users);

  const userHasWaitingOrder = (userId: string) => {
    return orders.some(order => order.userId === userId && order.status === OrderStatus.PAID);
  };

  const userInfoToShow = usersInfo.map((user: user) => {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: userHasWaitingOrder(user.id) ? user.phone : null,
      photo: user.photo,
    };
  });

  const ordersWithUserInfo = orders.map((order: any) => {
    order.user = userInfoToShow.find(user => user.id === order.userId);
    return order;
  });

  return ordersWithUserInfo;
};

type OrderQuery = {
  shopId: string;
  page: number;
  hitsPerPage: number;
  status?: OrderStatus;
};

export const getOrders = async ({ shopId, page = 1, hitsPerPage = 20 }: OrderQuery) => {
  const ordersSearchResult = await MeiliSearch.ordersIndex().search('', {
    filter: `shopId = ${shopId}`,
    page,
    hitsPerPage,
    sort: ['orderNumber:desc'],
  });
  const orders = ordersSearchResult.hits as Order[];

  return orders;
};

export const getOrdersWithUserInfo = async ({ shopId, page = 1, hitsPerPage = 20, status }: OrderQuery) => {
  const filter = [`shopId = ${shopId}`, `status != ${OrderStatus.WAITING_FOR_PAYMENT}`];

  if (status) {
    filter.push(`status = ${status}`);
  }

  const ordersSearchResult = await MeiliSearch.ordersIndex().search('', {
    filter,
    page,
    hitsPerPage,
    sort: ['orderNumber:desc'],
    facets: ['status'],
  });

  const orders = ordersSearchResult.hits as Order[];

  const ordersWithUserInfo = await concatUsersToOrders(orders);

  return {
    orders: ordersWithUserInfo,
    hitsPerPage: ordersSearchResult.hitsPerPage,
    page: ordersSearchResult.page,
    totalHits: ordersSearchResult.totalHits,
    totalPages: ordersSearchResult.totalPages,
    distribution: ordersSearchResult?.facetDistribution?.status,
  };
};

export const getInProgressOrders = async ({ shopId, page = 1, hitsPerPage = 20 }: OrderQuery) => {
  const statues = [
    OrderStatus.PAID,
    OrderStatus.ASSIGNED_TO_DELIVERY_MAN,
    OrderStatus.WAITING_FOR_DELIVERY_MAN,
    OrderStatus.DELIVERY_STARTING,
    OrderStatus.DELIVERY_PROCESSING,
    OrderStatus.DELIVERY_ALMOST_ARRIVED,
    OrderStatus.DELIVERY_ARRIVED,
  ];
  const filter = [`shopId = ${shopId}`, `status IN [${statues.map(status => `"${status}"`).join(', ')}]`];

  const ordersSearchResult = await MeiliSearch.ordersIndex().search('', { filter, page, hitsPerPage, sort: ['orderNumber:desc'] });
  const orders = ordersSearchResult.hits as Order[];

  const ordersWithUserInfo = await concatUsersToOrders(orders);

  return {
    orders: ordersWithUserInfo,
    hitsPerPage: ordersSearchResult.hitsPerPage,
    page: ordersSearchResult.page,
    totalHits: ordersSearchResult.totalHits,
    totalPages: ordersSearchResult.totalPages,
  };
};

export const getOrderStatuses = async (orderId: string) => {
  const order = await orderRepository.getOrderStatuses(orderId);
  return order;
};

export const getAllOrders = async ({ shopId }) => {
  const orders = await orderRepository.getAllOrders({ shopId });
  return orders;
};

export const getUserOrders = async ({ userId, filter = {} }) => {
  const orders = await orderRepository.getUserOrders({ userId, filter });
  return orders;
};

export const getDeliveredOrders = async ({ shopId, page = 1, hitsPerPage = 20 }) => {
  const orders = await getOrders({ shopId, page, hitsPerPage, status: OrderStatus.DELIVERED });
  return orders;
};

export const getOrderItems = async ({ orderId }) => {
  const items = await orderRepository.getOrderItems({ orderId });
  return items;
};

export const getOrderItemsByShop = async ({ orderId, shopId }) => {
  const items = await orderRepository.getOrderItemsByShop({ orderId, shopId });
  return items;
};

export const getFormatedOrderItems = async ({ orderId }) => {
  const items = await getOrderItems({ orderId });
  const formatedItems = await productService.formatItems({ items });
  return formatedItems;
};

export const allShopsAreReady = async (orderNumber: string) => {
  const shopOrder = await getOrdersByOrderNumber(orderNumber);
  return shopOrder.every(order => order.status === OrderStatus.WAITING_FOR_DELIVERY_MAN);
};

export const updateStatusById = async ({ orderId, status }) => {
  const orderStatus = await orderRepository.updateStatusById({ orderId, status });
  return orderStatus;
};

export const orderValidation = async ({ shopId, orderId }) => {
  const order = await getOrder({ orderId });
  const newStatus = OrderStatus.WAITING_FOR_DELIVERY_MAN;

  if (!order || order?.shopId !== shopId) {
    throw new Error('Order not found or not belong to this shop');
  }

  if (order.status !== OrderStatus.PAID) {
    throw new Error('Order already validated');
  }

  const updatedStatus = await updateStatusById({ orderId, status: newStatus });

  notifications.sendStatusUpdateToCustomer({ order, newStatus });

  order.status = newStatus;
  return order;

  // orderRepository.addToReadyOrders({ order, shop });
};

export const holdOrder = async ({ orderId, shopId }: { orderId: string; shopId: string }) => {
  const order = await getOrder({ orderId });

  if (!order || order?.shopId !== shopId) {
    throw new Error('Order not found or not belong to this shop');
  }

  if (order.status !== OrderStatus.WAITING_FOR_DELIVERY_MAN) {
    throw new Error("Order can't be hold");
  }

  const newStatus = OrderStatus.PAID;

  await updateStatusById({ orderId, status: newStatus });

  order.status = newStatus;
  return order;
};

export const isOrderAssignedToThisDeliveryMan = async ({ orderId, deliveryManId }) => {
  const order = await getOrder({ orderId });
  return order?.deliveryManId === deliveryManId;
};

export const isOrderAssigned = order => {
  return order.status === OrderStatus.ASSIGNED_TO_DELIVERY_MAN;
};

export const deliveryManTakeOrder = async ({ shopId, order, deliveryManId, code }) => {
  if (!order) {
    throw new Error('Order not found');
  }

  if (!isOrderAssigned(order)) {
    throw new Error('Order not ready');
  }

  if (!(await isOrderAssignedToThisDeliveryMan({ orderId: order.id, deliveryManId }))) {
    throw new Error('Order is not assigned to you');
  }

  const isCodeValid = await takingCodeIsValid({ orderId: order.id, code });

  if (!isCodeValid) {
    throw new Error('Invalid validation code');
  }
  await orderRepository.setOrderTaken({ orderId: order.id, deliveryManId });
  order.status = OrderStatus.DELIVERY_STARTING;

  return order;
};

export const removeUserOrders = async ({ userId }) => {
  const orders = await getUserOrders({ userId });

  if (!orders.length) {
    return;
  }

  return await orderRepository.removeOrders({ orders });
};

export const assignOrderToDeliveryMan = async ({ orderNumber, deliveryManId }) => {
  orderRepository.assignOrderToDeliveryMan({ orderNumber, deliveryManId });
};

export const formatOrderForDeliveryMan = async (order: Order) => {
  const { shopId } = order;

  const [shop, customer] = await Promise.all([shopService.getShop({ shopId }), userService.getUserByUid(order.userId)]);

  const distance = await getDistance(shop.address, order.deliveryAddress.position);

  const orderData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    distance,
    shopId,
    shopName: shop.name,
    creationDate: order.creationDate,
    reward: order.fees.totalDeliveryCost,
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
    },
    status: order.status,
  };

  return orderData;
};

export const sendOrderToDeliveryMans = async ({ order, shopId }: { order: Order; shopId: string }) => {
  const io = ioc.get('socketServer');
  const deliveryMans = await deliveryManService.deliveryMansAroundShop({ shopId });

  if (!deliveryMans.length) {
    console.log('No delivery mans around for shop ' + shopId);
    return;
  }

  const orderData = await formatOrderForDeliveryMan(order);

  deliveryMans.forEach((deliveryMan: any) => {
    io.to(deliveryMan.socketId).emit(OrderEmits.READY, orderData);
  });
};

export const sendNewOrderNotificationToShop = async (orderNumber: string) => {
  const shopsOrders = await getOrdersByOrderNumber(orderNumber);

  shopsOrders.forEach(async ({ shopId }) => {
    const shopSocketId = await shopService.getShopSocketId(shopId);
    if (!shopSocketId) {
      return;
    }

    orderRepository.sendOrderNotificationToShop(shopSocketId, shopsOrders[0]);
  });
};

export const sendOrderTakenNotification = async (orderId: string, shopId: string) => {
  const shopSocketId = await shopService.getShopSocketId(shopId);
  if (!shopSocketId) {
    return;
  }
  const order = await getOrder({ orderId });

  orderRepository.sendOrderTakenNotification(shopSocketId, order);
};

export const sendOrderDeliveredToShop = async (orderNumber: string) => {
  const orders = await getOrdersByOrderNumber(orderNumber);

  orders.forEach(async order => {
    const shopSocketId = await shopService.getShopSocketId(order.shopId);
    if (!shopSocketId) {
      return;
    }
    orderRepository.sendOrderDeliveredToShop(shopSocketId, order);
  });
};

export const sendPaymentNotification = async ({
  userId,
  paymentResult,
  orderNumber,
}: {
  userId: string;
  paymentResult: PaymentResult;
  orderNumber?: string;
}) => {
  const customerSocket = await userService.getUserSocket(userId);
  if (!customerSocket) {
    return;
  }

  if (orderNumber) {
    const order = await getOrderByOrderNumber(orderNumber);
    notifications.sendPaymentResultToCustomer({ paymentResult, order });
    return;
  }

  notifications.sendPaymentResultToCustomer({ paymentResult });
};

export const delivered = async ({ orderNumber, userId, deliveryManId, validationCode }) => {
  const orders = await getOrdersByOrderNumber(orderNumber);

  if (!orders.length) {
    throw new Error('Order not found');
  }

  const order = orders[0];

  if (order.userId !== userId) {
    throw new Error('Order not assigned to this user');
  }

  if (order.deliveryManId !== deliveryManId) {
    throw new Error('Order not assigned to this deliveryMan');
  }

  const codeIsValid = await deliveryCodeIsValid(order.orderNumber, validationCode);

  if (!codeIsValid) {
    throw new Error('Invalid validation code');
  }

  orders.map(order => {
    orderRepository.setDeliveredOrder({ orderId: order.id });
    order.status = OrderStatus.DELIVERED;

    return order;
  });

  notifications.sendStatusUpdateToCustomer({ order });
  sendOrderDeliveredToShop(order.orderNumber);
};

export const getValidationCode = async ({ orderId, userId }) => {
  const order = await getOrder({ orderId });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== userId) {
    throw new Error('Order not assigned to this user');
  }

  return order.code;
};

export const getUsersWhoOrdered = async ({ shopId }) => {
  const usersIds = await orderRepository.getOrdersUsersIds({ shopId });

  const users = await Promise.all(
    usersIds.map(async userId => {
      const user = await userService.getUserByUid(userId);
      return user;
    })
  );
  return users;
};

export const setDeliveryManPath = async ({ orderId, location }) => {
  await orderRepository.setDeliveryManPath({ orderId, location });
};

export const getDeliveryManPath = async ({ orderId }) => {
  return await orderRepository.getDeliveryManPath({ orderId });
};

export const countOrders = async ({ shopId, status }) => {
  return await orderRepository.count({ shopId, status });
};

export const allShopsOrdersTaken = orderNumber => {
  return orderRepository.allShopsOrdersTaken(orderNumber);
};

export const deliveryManHasOrder = async ({ deliveryManId }) => {
  const ordersCount = await orderRepository.countDeliveryManCurrentOrders({ deliveryManId });

  return ordersCount > 0;
};

export const getDeliveryManCurrentOrder = async ({ deliveryManId }) => {
  const orders = await orderRepository.getDeliveryManCurrentOrders({ deliveryManId });

  if (!orders) {
    return null;
  }

  const order = orders[0];

  return order;
};

export const getDeliveryManCurrentOrderData = async ({ deliveryManId }) => {
  const order = await getDeliveryManCurrentOrder({ deliveryManId });

  if (!order) {
    return null;
  }

  const customer = await userService.getUserByUid(order.userId);
  const shop = await shopService.getShop({ shopId: order.shopId });

  const distance = await getDistance(shop.address, order.deliveryAddress.position);

  const data = {
    orderId: order.id,
    userId: order.userId,
    orderNumber: order.orderNumber,
    status: order.status,
    creationDate: order.creationDate,
    customer: {
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: customer.adress,
    },
    reward: order.fees.totalDeliveryCost,
    distance,
    deliveryAddress: order.deliveryAddress,
    shop,
  };

  return data;
};

export const setOrderReward = async ({ order, deliveryManId }) => {
  const shop = await shopService.getShop({ shopId: order.shopId });
  const distance = await getDistance(shop.address, order.deliveryAddress.position);

  const reward = calculateReward(distance.distanceValue);

  await orderRepository.updateUserOrder({ orderNumber: order.orderNumber, data: { reward, deliveryManId } });
};

export const getDeliveryManStats = async ({ deliveryManId, month, year }) => {
  const stats = await orderRepository.getDeliveryManStats({ deliveryManId, month, year });

  return stats;
};

const formatOrdersForDeliveryMan = async ({ orders }: { orders: Order[] }) => {
  const shopsIds = orders.map(order => order.shopId);

  const shops = await shopService.getShopsPublicInfo(shopsIds);

  const formattedOrders = await Promise.all(
    orders.map(async order => {
      const shop = shops.find(shop => shop.id === order.shopId);
      delete shop?.openingTimes;

      const formattedOrder = {
        orderNumber: order.orderNumber,
        creationDate: order.creationDate.toDate(),
        reward: order.fees.totalDeliveryCost,
        distance: order.distance,
        deliveryAddress: order.deliveryAddress,
        shop,
      };
      return formattedOrder;
    })
  );

  return formattedOrders;
};

export const getLastDayDeliveryManOrders = async ({ deliveryManId }) => {
  const orders = await orderRepository.getLastDayDeliveryManOrders({ deliveryManId });

  const formattedOrders = await formatOrdersForDeliveryMan({ orders });

  return formattedOrders;
};

export const getLastMonthDeliveryManOrders = async ({ deliveryManId }) => {
  const orders = await orderRepository.getLastMonthDeliveryManOrders({ deliveryManId });
  const formattedOrders = await formatOrdersForDeliveryMan({ orders });

  return formattedOrders;
};

export const setOrderFailed = async ({ orderNumber, paymentResult }) => {
  await orderRepository.setOrderFailed({ orderNumber, paymentResult });
};

export const cancelOrder = async ({ orderId, shopId }) => {
  const order = await getOrder({ orderId });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.shopId !== shopId) {
    throw new Error('Order not assigned to this shop');
  }

  if (order.status != OrderStatus.PAID) {
    throw new Error('Invalid order status');
  }

  await orderRepository.cancelOrder({ orderId });
};

export const declineOrder = async ({ orderId, deliveryManId }) => {
  const order = await getOrder({ orderId });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status != OrderStatus.WAITING_FOR_DELIVERY_MAN) {
    return;
  }

  return Promise.all([
    orderRepository.addDeclinedDeliveryMan({ orderId, deliveryManId }),
    deliveryManService.addDeclinedOrder({ deliveryManId, orderId }),
  ]);
};

export const getOrdersAroundOfDeliveryMan = async (deliveryMan: DeliveryMan, skip?: string[]) => {
  const { DELIVERY_RADIUS } = config;

  if (!deliveryMan.localisation) {
    return [];
  }

  const { latitude, longitude } = deliveryMan.localisation;

  const filter = [
    `_geoRadius(${latitude}, ${longitude}, ${DELIVERY_RADIUS})`,
    `status = ${OrderStatus.WAITING_FOR_DELIVERY_MAN}`,
    `declinedDeliveryManIds != ${deliveryMan.deliveryManId} OR declinedDeliveryManIds NOT EXISTS`,
  ];

  if (skip) {
    const skipList = skip.map(s => `"${s}"`).join(',');
    filter.push(`orderNumber NOT IN [${skipList}]`);
  }

  const index = MeiliSearch.ordersIndex();
  const results = await index.search('', {
    filter,
    sort: [`_geoPoint(${latitude}, ${longitude}):asc`, 'creationDate:desc'],
  });

  return results.hits as Order[];
};
