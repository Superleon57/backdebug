import * as admin from 'firebase-admin';

import ioc from 'src/utils/iocContainer';
import { Order, ShopOrder, UsersOrders } from 'src/entities/order';
import { Item, OrderItem } from 'src/entities/item';
import { OrderStatus } from 'src/enums/OrderStatus.enum';

import { calculateTotalPerShop } from 'src/utils/order';
import { OrderEmits } from 'src/enums/OrderEvents.enum';
import { calculateStats } from 'src/utils/rewards';
import { Cart } from 'src/entities/cart';
import { CalculatedFees, Fees } from 'src/entities/Fees';
import { Shop } from 'src/entities/shop';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getOrderItemsRef } from './orderItems';

export const getOrderRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('Orders') as FirebaseFirestore.CollectionReference<Order>;
};

export const getUsersOrdersRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('UsersOrders') as FirebaseFirestore.CollectionReference<UsersOrders>;
};

export const findOne = async ({ orderId }) => {
  const orderRepository = ioc.get('orderRepository');
  const order = await orderRepository.whereEqualTo(order => order.id, orderId).findOne();
  return order;
};

export const findOneById = async ({ orderId }: { orderId: string }) => {
  const orderRef = getOrderRef();
  const order = await orderRef.doc(orderId).get();
  return order.data();
};

export const findOneByOrderNumber = async orderNumber => {
  const orderRef = getOrderRef();
  const order = await orderRef.where('orderNumber', '==', orderNumber).get();
  return order.docs[0].data();
};

export const findManyByOrderNumber = async orderNumber => {
  const orderRef = getOrderRef();
  const order = await orderRef.where('orderNumber', '==', orderNumber).get();
  return order.docs.map(doc => doc.data());
};

export const findOneByShop = async ({ orderId, shopId }) => {
  const orderRef = getOrderRef();

  const orderQuery = orderRef.doc(orderId);
  const orderSnapshot = await orderQuery.get();

  const order = orderSnapshot.data();

  if (order?.shopId !== shopId) {
    return null;
  }

  return order;
};

export const getOrders = async ({ shopId, limit, offset = '', previous = false }): Promise<Order[]> => {
  const orderRef = getOrderRef();
  let query = orderRef.where('shopId', '==', shopId).limit(limit).orderBy('orderNumber', 'desc');

  if (offset) {
    query = previous ? query.endBefore(offset) : query.startAfter(offset);
  }

  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => {
    const order = doc.data();
    return order;
  });

  return orders;
};

export const getOrdersByStatus = async ({ shopId, status, limit, offset, previous = false }) => {
  const orderRef = getOrderRef();
  let query = orderRef.where('shopId', '==', shopId).where('status', '==', status).orderBy('orderNumber', 'desc');

  if (offset) {
    query = previous ? query.endBefore(offset) : query.startAfter(offset);
  }

  query = query.limit(limit);

  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const getInProgressOrders = async ({ shopId, offset, limit }) => {
  const orderRef = getOrderRef();
  const query = orderRef.where('shopId', '==', shopId).where('status', '!=', OrderStatus.DELIVERED).limit(limit);

  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const getUserOrders = async ({ userId, filter }) => {
  const orderRef = getOrderRef();
  let query = orderRef.where('userId', '==', userId);

  if (filter.shopId) {
    query = query.where('shopId', '==', filter.shopId);
  }

  if (filter.limit) {
    query = query.limit(filter.limit);
  }

  if (filter.offset) {
    query = query.offset(filter.offset);
  }

  const querySnapshot = await query.get();
  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const getAllOrders = async ({ shopId }) => {
  const orderRef = getOrderRef();

  const query = orderRef.where('shopId', '==', shopId).orderBy('orderNumber', 'desc');
  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const getOrderStatuses = async (orderNumber: string) => {
  const orderRef = getOrderRef();
  const ordersQuery = await orderRef.where('orderNumber', '==', orderNumber);

  const querySnapshot = await ordersQuery.get();

  return querySnapshot.docs.map(doc => {
    return { ...doc.data(), ref: doc.ref };
  });
};

export const updateStatusById = async ({ orderId, status }) => {
  const orderRef = getOrderRef();

  const order = orderRef.doc(orderId);

  return order.update({ status });
};

export const createOrderedItems = async ({ items, orderId, batch }: { items: Item[]; orderId: string; batch: admin.firestore.WriteBatch }) => {
  for (const item of items) {
    const itemRef = getOrderItemsRef().doc();

    const orderedItem = { ...item, id: itemRef.id } as OrderItem;
    orderedItem.creationDate = new Date();
    orderedItem.orderId = orderId;
    batch.set(itemRef, orderedItem);
  }
};

export const getUniqueShopIds = items => {
  return items.reduce((acc, item) => {
    if (!acc.includes(item.shopId)) {
      acc.push(item.shopId);
    }
    return acc;
  }, []);
};

const createUserOrder = async ({ userId, orderNumber, shopId, orderId, batch }) => {
  const userOrderRef = getUsersOrdersRef().doc(orderNumber.toString());

  const userOrder = {
    userId,
    orderNumber,
    shopId,
    orderId,
    creationDate: new Date(),
  };

  batch.set(userOrderRef, userOrder);
};

export const updateUserOrder = async ({ orderNumber, data }) => {
  const userOrderRef = getUsersOrdersRef().doc(orderNumber);

  return userOrderRef.update(data, { merge: true });
};

export const getOrderOwnerId = async ({ orderNumber }: { orderNumber: string }) => {
  const userOrderRef = getUsersOrdersRef().doc(orderNumber.toString());
  const userOrderSnapshot = await userOrderRef.get();

  if (!userOrderSnapshot.exists) {
    return null;
  }

  const userOrder = userOrderSnapshot.data() as UsersOrders;

  return userOrder.userId;
};

type CreateOrderParams = {
  userId: string;
  deliveryAddress: any;
  items: Item[];
  cart: Cart;
  fees: CalculatedFees;
  shop: Shop;
};

export const createOrder = async ({ items, userId, deliveryAddress, cart, fees, shop }: CreateOrderParams) => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;

  const orderNumber = new Date().getTime().toString();
  const shopId = shop.id;

  const newOrderRef = getOrderRef().doc();
  const newOrder: Order = {
    id: newOrderRef.id,
    userId,
    shopId: shopId,
    status: OrderStatus.WAITING_FOR_PAYMENT,
    total: calculateTotalPerShop(items, shopId),
    creationDate: Timestamp.now(),
    orderNumber: orderNumber,
    deliveryAddress,
    fees: fees,
    distance: cart.distance,
    isAGift: false,
    _geo: shop._geo,
  };

  const batch = db.batch();

  const orderId = newOrderRef.id;
  batch.set(newOrderRef, newOrder);
  createOrderedItems({ items, orderId, batch });

  createUserOrder({ userId, orderNumber, shopId, orderId, batch });

  await batch.commit();
  return { orderNumber, orderId };
};

export const getProcessingOrders = async ({ shopId }) => {
  const orderRepository = ioc.get('orderRepository');
  const processingOrders = await orderRepository.whereEqualTo(order => order.shopsStatus[shopId].status, OrderStatus.PAID).find();
  return processingOrders;
};

export const getOrderItems = async ({ orderId }) => {
  const orderItemsRef = getOrderItemsRef();
  const query = orderItemsRef.where('orderId', '==', orderId);
  const querySnapshot = await query.get();

  const items = querySnapshot.docs.map(doc => doc.data());

  return items;
};

export const getOrderItemsByShop = async ({ orderId, shopId }) => {
  const orderItemsRef = getOrderItemsRef();
  const query = orderItemsRef.where('orderId', '==', orderId).where('shopId', '==', shopId);
  const querySnapshot = await query.get();

  const items = querySnapshot.docs.map(doc => doc.data());

  return items;
};

export const updateOrder = async ({ order }) => {
  const orderRepository = ioc.get('orderRepository');
  return await orderRepository.update(order);
};

export const removeOrders = async ({ orders }) => {
  const orderRepository = ioc.get('orderRepository');
  const batch = orderRepository.createBatch();

  for (const order of orders) {
    batch.delete(order);
  }

  return await batch.commit();
};

export const assignOrderToDeliveryMan = async ({ orderNumber, deliveryManId }) => {
  const orderRef = getOrderRef();
  const query = orderRef.where('orderNumber', '==', orderNumber);
  const querySnapshot = await query.get();

  querySnapshot.forEach(async doc => {
    await doc.ref.set({ deliveryManId, assignedDate: new Date(), status: OrderStatus.ASSIGNED_TO_DELIVERY_MAN }, { merge: true });
  });
};

export const addToReadyOrders = async ({ order, shop }) => {
  const db = ioc.get('db');
  const readyOrderRef = db.ref(`readyOrders/${order.id}`);

  readyOrderRef.set({
    shopId: shop.id,
    orderId: order.id,
  });
};

export const sendOrderNotificationToShop = async (shopSocketId: string, order: object) => {
  const io = ioc.get('socketServer');

  io.to(shopSocketId).emit(OrderEmits.NEW_ORDER, { order });
};

export const sendOrderTakenNotification = async (shopSocketId: string, order: object) => {
  const io = ioc.get('socketServer');

  io.to(shopSocketId).emit(OrderEmits.TAKEN, { order });
};

export const sendOrderDeliveredToShop = async (shopSocketId: string, order: object) => {
  const io = ioc.get('socketServer');

  io.to(shopSocketId).emit(OrderEmits.DELIVERED, { order });
};

export const getOrdersUsersIds = async ({ shopId }) => {
  const db = ioc.get('firestore');
  const querySnapshot = await db.collection('UsersOrders').where('shopId', '==', shopId).get();
  const usersIds = querySnapshot.docs.reduce((acc, doc) => {
    const { userId } = doc.data();
    if (!acc.includes(userId)) {
      acc.push(userId);
    }
    return acc;
  }, []);

  return usersIds;
};

export const setDeliveryManPath = async ({ orderId, location }) => {
  const orderRef = getOrderRef();
  const deliveryManRef = orderRef.doc(orderId).collection('deliveryManPath').doc();

  return await deliveryManRef.set({ location, creationDate: new Date() });
};

export const getDeliveryManPath = async ({ orderId }) => {
  const orderRef = getOrderRef();
  const deliveryManRef = orderRef.doc(orderId).collection('deliveryManPath').orderBy('creationDate', 'desc');
  const querySnapshot = await deliveryManRef.get();

  const path = querySnapshot.docs.map(doc => doc.data().location);

  return path;
};

export const getDeliveryManCurrentOrders = async ({ deliveryManId }) => {
  const orderRef = getOrderRef();

  const statusToInclude = [OrderStatus.ASSIGNED_TO_DELIVERY_MAN, OrderStatus.WAITING_FOR_DELIVERY_MAN, OrderStatus.DELIVERY_STARTING];

  const query = orderRef.where('deliveryManId', '==', deliveryManId).where('status', 'in', statusToInclude);
  const querySnapshot = await query.get();

  if (querySnapshot.empty) {
    return null;
  }

  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const count = async ({ shopId, status }) => {
  const orderRef = getOrderRef();
  let query = orderRef.where('shopId', '==', shopId);

  if (status) {
    query = query.where('status', '==', status);
  }

  const querySnapshot = await query.count().get();

  return querySnapshot.data().count;
};

export const allShopsOrdersTaken = async orderNumber => {
  const orders = await findManyByOrderNumber(orderNumber);
  const allShopsOrdersTaken = orders.every(order => order.status === OrderStatus.DELIVERY_STARTING);

  return allShopsOrdersTaken;
};

export const countDeliveryManCurrentOrders = async ({ deliveryManId }) => {
  const orderRef = getOrderRef();

  const StatusToInclude = [OrderStatus.ASSIGNED_TO_DELIVERY_MAN, OrderStatus.WAITING_FOR_DELIVERY_MAN, OrderStatus.DELIVERY_STARTING];

  const query = orderRef.where('deliveryManId', '==', deliveryManId).where('status', 'in', StatusToInclude);
  const querySnapshot = await query.count().get();

  return querySnapshot.data().count;
};

export const getDeliveryManStats = async ({ deliveryManId, month, year }) => {
  const usersOrdersRef = getUsersOrdersRef();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const query = usersOrdersRef
    .where('deliveryManId', '==', deliveryManId)
    .where('creationDate', '>=', startDate)
    .where('creationDate', '<=', endDate);

  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => doc.data()) as UsersOrders[];
  const stats = calculateStats(orders);

  return stats;
};

export const setOrdersPaid = async ({ orderNumber, paymentResult }) => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  const batch = db.batch();

  const orderRef = getOrderRef();
  const ordersQuery = orderRef.where('orderNumber', '==', orderNumber);
  const querySnapshot = await ordersQuery.get();

  if (querySnapshot.empty) {
    return null;
  }

  for (const doc of querySnapshot.docs) {
    batch.set(
      doc.ref,
      {
        status: OrderStatus.PAID,
        paymentDate: new Date(),
        paymentResult,
      },
      { merge: true }
    );
  }

  await batch.commit();

  return true;
};

export const setOrderTaken = async ({ orderId, deliveryManId }) => {
  const orderRef = getOrderRef();
  const order = orderRef.doc(orderId);
  return await order.set(
    {
      status: OrderStatus.DELIVERY_STARTING,
      deliveryStartDate: new Date(),
      deliveryManId,
    },
    { merge: true }
  );
};

export const setDeliveredOrder = async ({ orderId }) => {
  const orderRef = getOrderRef();
  const order = orderRef.doc(orderId);
  return await order.set(
    {
      status: OrderStatus.DELIVERED,
      deliveryDate: new Date(),
    },
    { merge: true }
  );
};

export const getLastDayDeliveryManOrders = async ({ deliveryManId }) => {
  const orderRef = getOrderRef();

  const last24Hours = new Date();
  last24Hours.setDate(last24Hours.getDate() - 1);

  const query = orderRef.where('deliveryManId', '==', deliveryManId).where('creationDate', '>=', last24Hours);
  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const getLastMonthDeliveryManOrders = async ({ deliveryManId }) => {
  const orderRef = getOrderRef();

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const query = orderRef.where('deliveryManId', '==', deliveryManId).where('creationDate', '>=', lastMonth);
  const querySnapshot = await query.get();

  const orders = querySnapshot.docs.map(doc => doc.data());

  return orders;
};

export const setOrderFailed = async ({ orderNumber, paymentResult }) => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  const batch = db.batch();

  const orderRef = getOrderRef();
  const ordersQuery = orderRef.where('orderNumber', '==', orderNumber);
  const querySnapshot = await ordersQuery.get();

  if (querySnapshot.empty) {
    return null;
  }

  for (const doc of querySnapshot.docs) {
    batch.set(
      doc.ref,
      {
        status: OrderStatus.FAILED,
        paymentResult,
      },
      { merge: true }
    );
  }

  await batch.commit();

  return true;
};

export const addDeclinedDeliveryMan = async ({ orderId, deliveryManId }) => {
  const orderRef = getOrderRef().doc(orderId);

  return orderRef.update({
    declinedDeliveryManIds: FieldValue.arrayUnion(deliveryManId),
  });
};

export const cancelOrder = async ({ orderId }) => {
  const orderRef = getOrderRef().doc(orderId);

  return orderRef.update({
    status: OrderStatus.CANCELED,
    canceledDate: Timestamp.now(),
    cancelReason: 'Products out of stock',
  });
};
