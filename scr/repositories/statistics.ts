import dayjs from 'dayjs';
import ioc from 'src/utils/iocContainer';
import { getUsersOrdersRef } from './order';
import { getOrderItemsRef } from './orderItems';

export const incomeByDate = async ({ shopId, start, end }) => {
  const orderItemsRef = getOrderItemsRef();

  const query = orderItemsRef.where('shopId', '==', shopId).where('creationDate', '>=', start).where('creationDate', '<=', end);

  const querySnapshot = await query.get();

  const items = querySnapshot.docs.map(doc => doc.data());

  const income = items.reduce((acc, item) => acc + item.price, 0);

  return income;
};

export const soldByDate = async ({ shopId, start, end }) => {
  const orderItemsRef = getOrderItemsRef();

  const query = orderItemsRef.where('shopId', '==', shopId).where('creationDate', '>=', start).where('creationDate', '<=', end);

  const querySnapshot = await query.get();

  const items = querySnapshot.docs.map(doc => doc.data());

  return items;
};

export const countNewCustomers = async ({ shopId }) => {
  const orderItemsRef = getUsersOrdersRef();
  const query = orderItemsRef.where('shopIds', 'array-contains', shopId).orderBy('creationDate', 'asc');
  const querySnapshot = await query.get();

  const items = querySnapshot.docs.map(doc => doc.data());

  const currentDate = dayjs();
  const thirtyDaysAgo = currentDate.subtract(30, 'day');

  const customers = [];

  items.forEach(item => {
    const customer = customers.find(c => c.userId === item.userId);
    const creationDate = dayjs(item.creationDate.toDate());

    if (!customer && creationDate.isAfter(thirtyDaysAgo)) {
      customers.push({ userId: item.userId, creationDate: item.creationDate.toDate() });
    }
  });

  return customers.length;
};
