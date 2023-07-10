import { Fees } from 'src/entities/Fees';
import ioc from 'src/utils/iocContainer';

export const getFeesRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('Fees') as FirebaseFirestore.CollectionReference<Fees>;
};

export const getFees = async () => {
  try {
    const feesRef = getFeesRef().doc('general');
    const fees = await feesRef.get();

    return fees.data() as Fees;
  } catch (err) {
    throw err;
  }
};

export const update = async fees => {
  try {
    const feesRef = getFeesRef().doc('general');

    await feesRef.set(fees, { merge: true });
  } catch (err) {
    throw err;
  }
};

export const getShopFees = async ({ shopId }) => {
  try {
    const feesRef = getFeesRef().doc(shopId);
    const fees = await feesRef.get();

    return fees.data() as Fees;
  } catch (err) {
    throw err;
  }
};

export const updateShopFees = async ({ shopId, fees }) => {
  try {
    const feesRef = getFeesRef().doc(shopId);

    await feesRef.set(fees, { merge: true });
  } catch (err) {
    throw err;
  }
};
