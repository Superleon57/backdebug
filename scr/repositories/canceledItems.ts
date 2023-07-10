import { Timestamp } from 'firebase-admin/firestore';
import { OrderItem } from 'src/entities/order';
import { CanceledItem } from 'src/entities/order';
import ioc from 'src/utils/iocContainer';

export const getCanceledItemsRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('CanceledItems') as FirebaseFirestore.CollectionReference<CanceledItem>;
};

export const getCanceledItem = async (id: string) => {
  const canceledItemsRef = getCanceledItemsRef().doc(id);
  const canceledItem = await canceledItemsRef.get();

  return canceledItem.data();
};

export const getCanceledItems = async (orderId: string) => {
  const canceledItemsRef = getCanceledItemsRef();
  const canceledItems = await canceledItemsRef.where('orderId', '==', orderId).get();

  return canceledItems.docs.map(doc => doc.data());
};

export const findCanceledItem = async (orderId: string, productId: string) => {
  const canceledItemsRef = getCanceledItemsRef();
  const canceledItems = await canceledItemsRef.where('orderId', '==', orderId).where('productId', '==', productId).get();

  return canceledItems.docs.map(doc => doc.data());
};

export const createCanceledItem = async (item: OrderItem, quantity: number) => {
  const canceledItemRef = getCanceledItemsRef().doc(item.id);
  const canceledItem: CanceledItem = {
    ...item,
    quantity,
    reason: '',
    refund: item.price * quantity,
    refundDate: Timestamp.now(),
  };
  await canceledItemRef.set(canceledItem);
  return canceledItem;
};

export const cancelItems = async (orderId: string, itemsToCancel: OrderItem[]) => {
  const canceledItemsRef = getCanceledItemsRef();

  const batch = canceledItemsRef.firestore.batch();

  itemsToCancel.forEach(item => {
    const docId = `${orderId}_${item.id}`;
    const canceledItemRef = canceledItemsRef.doc(docId);

    const canceledItem = {
      ...item,
      quantity: item.quantity,
      id: docId,
      reason: '',
    };

    batch.set(canceledItemRef, canceledItem);
  });

  await batch.commit();
};
