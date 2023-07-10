import { OrderItem } from 'src/entities/order';
import ioc from 'src/utils/iocContainer';

export const getOrderItemsRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('OrderItems') as FirebaseFirestore.CollectionReference<OrderItem>;
};

export const getOrderItems = async (orderId: string) => {
  const orderItemsRef = getOrderItemsRef();
  const orderItems = await orderItemsRef.where('orderId', '==', orderId).get();

  return orderItems.docs.map(doc => doc.data());
};

export const getOrderItem = async (orderId: string, productId: string) => {
  const orderItemsRef = getOrderItemsRef();
  const orderItemsSnapshot = await orderItemsRef.where('orderId', '==', orderId).where('productId', '==', productId).get();

  const orderItems = orderItemsSnapshot.docs.map(doc => doc.data());

  return orderItems[0];
};

export const createCanceledItem = async (item: OrderItem, canceledQuantity: number) => {
  const canceledItemRef = getOrderItemsRef().doc(item.id);

  return canceledItemRef.set({ canceledQuantity }, { merge: true });
};

export const cancelItems = async (itemsToCancel: OrderItem[]) => {
  const canceledItemsRef = getOrderItemsRef();

  const batch = canceledItemsRef.firestore.batch();

  itemsToCancel.forEach(itemToCancel => {
    const canceledItemRef = canceledItemsRef.doc(itemToCancel.id);
    batch.set(canceledItemRef, { canceledQuantity: itemToCancel.quantity }, { merge: true });
  });

  await batch.commit();
};
