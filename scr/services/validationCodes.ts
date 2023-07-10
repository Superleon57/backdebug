import { OrderValidationCode } from 'src/entities/OrderValidationCode';
import * as validationCodesRepository from 'src/repositories/validationCodes';
import * as userServices from 'src/services/user';

export const generateTakingCode = async (orderId: string) => {
  return await validationCodesRepository.generateTakingCode(orderId);
};

export const generateDeliveryCode = async (orderNumber: string) => {
  return await validationCodesRepository.generateDeliveryCode(orderNumber);
};

export const takingCodeIsValid = async ({ orderId, code }: { orderId: string; code: string }): Promise<boolean> => {
  return await validationCodesRepository.takingCodeIsValid({ orderId, code });
};

export const deliveryCodeIsValid = async (orderNumber: string, code: number) => {
  return await validationCodesRepository.deliveryCodeIsValid(orderNumber, code);
};

export const getDeliveryCode = async ({ orderNumber }: { orderNumber: string }) => {
  const deliveryCode = await validationCodesRepository.getDeliveryCode(orderNumber);

  return deliveryCode;
};

export const getTakingCode = async ({ orderId }: { orderId: string }) => {
  const takingCode = await validationCodesRepository.getTakingCode(orderId);

  return takingCode;
};
