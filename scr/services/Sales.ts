import moment from 'moment';
import * as salesRepository from '../repositories/Sales';
import * as orderService from './order';
import { Counter } from 'src/firebase-extensions/counter';
import { Item } from 'src/entities/item';

export const getTopTenSalesByDate = async (shopId: string, date: string) => {
  return await salesRepository.getTopTenSalesByDate(shopId, date);
};

export const getTodayTopTenSales = async (shopId: string) => {
  const date = moment().format('YYYY-MM-DD');
  return await salesRepository.getTopTenSalesByDate(shopId, date);
};

export const incrementSale = async (item: Item) => {
  const date = moment().format('YYYY-MM-DD');
  const sale = salesRepository.getSaleByDateRef(item.shopId, date).doc(item.productId);

  const counter = new Counter(sale, 'quantity');
  counter.incrementBy(1);

  return;
};

export const incrementSaleForOrder = async (orderId: string) => {
  const orderItems = await orderService.getOrderItems({ orderId });

  for (const item of orderItems) {
    await incrementSale(item);
  }

  return;
};
