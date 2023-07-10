import type { Geopoint } from 'geofire-common';

import ioc from 'src/utils/iocContainer';
import { Roles } from 'src/enums/Roles.enum';
import { FieldValue } from 'firebase-admin/firestore';
import { DeliveryMan } from 'src/entities/deliveryMan';

const getDeliveryManRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('deliveryMans') as FirebaseFirestore.CollectionReference<DeliveryMan>;
};

export const findOneById = async (deliveryManId: string) => {
  const deliveyManRef = getDeliveryManRef().doc(deliveryManId);
  const deliveryMan = await deliveyManRef.get();
  return deliveryMan.data();
};

export const getDeliveryManByOrderNumber = async (orderNumber: string) => {
  const deliveyManRef = getDeliveryManRef();
  const query = deliveyManRef.where('orderNumber', '==', orderNumber);

  const querySnapshot = await query.get();

  if (querySnapshot.empty) {
    return;
  }

  const deliveryMan = querySnapshot.docs[0].data();

  return deliveryMan;
};

export const setLocation = async ({ uid, localisation }: { uid: string; localisation: Geopoint }) => {
  const deliveryManRef = getDeliveryManRef().doc(uid);
  const [latitude, longitude] = localisation;

  const res = await deliveryManRef.update({
    localisation: { latitude, longitude },
    _geo: { lat: latitude, lng: longitude },
  });

  return res;
};

export const ready = async ({ uid, status, socketId }) => {
  const deliveryManref = getDeliveryManRef().doc(uid);

  const res = await deliveryManref.set(
    {
      deliveryManId: uid,
      isReady: status,
      socketId,
    },
    { merge: true }
  );

  return res;
};
export const disconnect = async ({ uid }) => {
  const deliveryManref = getDeliveryManRef().doc(uid);

  const res = await deliveryManref.set({ socketId: null, isReady: false, declinedOrders: [] }, { merge: true });

  return res;
};

export const getDeliveryMans = async () => {
  const userRepository = ioc.get('userRepository');
  const users = await userRepository.whereEqualTo('role', Roles.DELIVERY_MAN).find();

  return users;
};

export const takeOrder = async ({ uid, orderNumber }) => {
  const deliveryManRef = getDeliveryManRef().doc(uid);

  const res = await deliveryManRef.set({ orderNumber, isReady: false }, { merge: true });
  return res;
};

export const addDeclinedOrder = async ({ deliveryManId, orderId }) => {
  const deliveryManRef = getDeliveryManRef().doc(deliveryManId);

  const res = await deliveryManRef.update({
    declinedOrders: FieldValue.arrayUnion(orderId),
  });

  return res;
};
