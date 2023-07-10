import { OrderItem } from 'src/entities/order';
import * as orderItemsRepository from 'src/repositories/orderItems';

export const getOrderItems = async orderId => {
  const orderItems = await orderItemsRepository.getOrderItems(orderId);
  return orderItems;
};

export const getOrderItem = async (orderId, productId) => {
  const orderItem = await orderItemsRepository.getOrderItem(orderId, productId);
  return orderItem;
};

export const cancelItems = async ({ itemsToCancel }: { orderId: string; itemsToCancel: OrderItem[] }) => {
  if (itemsToCancel.length === 0) return;
  return orderItemsRepository.cancelItems(itemsToCancel);
};
