import { Timestamp } from 'firebase-admin/firestore';
import { OrderItem } from 'src/entities/order';

import { ReturnedItem } from 'src/entities/order';
import ioc from 'src/utils/iocContainer';

export const getReturnedItemsRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('ReturnedItems') as FirebaseFirestore.CollectionReference<ReturnedItem>;
};

export const getReturnedItem = async (id: string) => {
  const returnedItemsRef = getReturnedItemsRef().doc(id);
  const returnedItem = await returnedItemsRef.get();

  return returnedItem.data();
};

export const getReturnedItems = async (orderId: string) => {
  const returnedItemsRef = getReturnedItemsRef();
  const returnedItems = await returnedItemsRef.where('orderId', '==', orderId).get();

  return returnedItems.docs.map(doc => doc.data());
};

export const createReturnedItem = async (item: OrderItem, quantity: number) => {
  const returnedItemRef = getReturnedItemsRef().doc(item.id);
  const returnedItem: ReturnedItem = {
    ...item,
    quantity,
    reason: '',
    refund: item.price * quantity,
    refundDate: Timestamp.now(),
  };
  await returnedItemRef.set(returnedItem);
  return returnedItem;
};

export const findReturnedItem = async (orderId: string, productId: string) => {
  const returnedItemsRef = getReturnedItemsRef();
  const returnedItems = await returnedItemsRef.where('orderId', '==', orderId).where('productId', '==', productId).get();

  return returnedItems.docs.map(doc => doc.data());
};
