import ioc from 'src/utils/iocContainer';
import { DeliveryCodes } from 'src/enums/DeliveryCodes.enum';
import { OrderValidationCode } from 'src/entities/OrderValidationCode';

export const getValidationCodesRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('ValidationCodes');
};

export const getDeliveryCode = async (orderNumber: string): Promise<OrderValidationCode | null> => {
  const ref = getValidationCodesRef();
  const query = await ref.where('orderNumber', '==', orderNumber).where('type', '==', DeliveryCodes.DELIVERY).get();

  if (query.empty) {
    return null;
  }

  const code = query.docs[0].data() as OrderValidationCode;

  return code;
};

export const getTakingCode = async (orderId: string) => {
  const ref = getValidationCodesRef();
  const query = await ref.where('orderId', '==', orderId).where('type', '==', DeliveryCodes.TAKING).get();

  if (query.empty) {
    return;
  }

  const code = query.docs[0].data();

  return code;
};

export const generateCode = async () => {
  const deliveryCode = Math.floor(100000 + Math.random() * 900000);
  return deliveryCode;
};

export const takingCodeIsValid = async ({ orderId, code }) => {
  const ref = getValidationCodesRef();
  const query = await ref.where('orderId', '==', orderId).where('code', '==', code).where('type', '==', DeliveryCodes.TAKING).get();

  return query.empty ? false : true;
};

export const deliveryCodeIsValid = async (orderNumber: string, code: number) => {
  const ref = getValidationCodesRef();
  const query = await ref.where('orderNumber', '==', orderNumber).where('code', '==', code).where('type', '==', DeliveryCodes.DELIVERY).get();

  return query.empty ? false : true;
};

export const generateTakingCode = async (orderId: string) => {
  const code = await generateCode();
  const ref = getValidationCodesRef().doc(orderId);
  const newCode = await ref.set({
    orderId,
    code,
    type: DeliveryCodes.TAKING,
    createdAt: new Date(),
  });

  return code;
};

export const generateDeliveryCode = async (orderNumber: string) => {
  const code = await generateCode();
  const ref = getValidationCodesRef();
  const newCode = await ref.add({
    orderNumber,
    code,
    type: DeliveryCodes.DELIVERY,
    createdAt: new Date(),
  });

  return newCode;
};
