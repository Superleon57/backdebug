import { OrderItem } from 'src/entities/order';
import * as canceledItemsService from 'src/services/canceledItems';
import * as returnedItemsRepository from 'src/repositories/returnedItems';

export const getReturnedItem = async (id: string) => {
  return returnedItemsRepository.getReturnedItem(id);
};

export const findReturnedItem = async (orderId: string, productId: string) => {
  return returnedItemsRepository.findReturnedItem(orderId, productId);
};

const canReturnItem = async (orderedItem: OrderItem, quantity: number) => {
  const { orderId, productId } = orderedItem;
  const returnedItems = await findReturnedItem(orderId, productId);
  const returnedQuantity = returnedItems.reduce((acc, item) => acc + item.quantity, 0);

  const canceledItem = await canceledItemsService.findCanceledItem(orderId, productId);
  const canceledQuantity = canceledItem?.reduce((acc, item) => acc + item.quantity, 0);

  return quantity <= orderedItem.quantity - returnedQuantity - canceledQuantity;
};

export const cancelItem = async (orderedItem: OrderItem, quantity: number) => {
  const canCancel = await canReturnItem(orderedItem, quantity);

  if (!canCancel) {
    throw new Error('Cannot cancel item');
  }

  await returnedItemsRepository.createReturnedItem(orderedItem, quantity);
};
