import { OrderItem } from 'src/entities/order';
import * as orderServices from 'src/services/order';
import * as canceledItemsRepository from 'src/repositories/canceledItems';

export const createCanceledItem = async (item: OrderItem, quantity: number) => {
  if (item.quantity < quantity) {
    throw new Error('Quantity is greater than the quantity of the item');
  }

  return canceledItemsRepository.createCanceledItem(item, quantity);
};

export const getCanceledItem = async (id: string) => {
  return canceledItemsRepository.getCanceledItem(id);
};

export const findCanceledItem = async (orderId: string, productId: string) => {
  return canceledItemsRepository.findCanceledItem(orderId, productId);
};

export const getCanceledItems = async (orderId: string) => {
  return canceledItemsRepository.getCanceledItems(orderId);
};

export const cancelItems = async ({ orderId, itemsToCancel, shopId }: { orderId: string; shopId; itemsToCancel: OrderItem[] }) => {
  if (itemsToCancel.length === 0) return;

  const orderedItems = await orderServices.getOrderItemsByShop({ orderId, shopId });

  itemsToCancel.forEach(itemToCancel => {
    const item = orderedItems.find(orderedItem => orderedItem.productId === itemToCancel.id);

    if (!item) {
      throw new Error('Item not found');
    }
    if (itemToCancel.quantity > item.quantity) {
      throw new Error('Quantity is greater than the quantity of the item');
    }
  });

  return canceledItemsRepository.cancelItems(orderId, itemsToCancel);
};
