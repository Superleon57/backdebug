import { Collection } from 'fireorm';
import { Product } from './product';

export class Item {
  id: string;
  productId: string;
  shopId: string;
  quantity: number;
  price: number;
  total: number;
  variantId?: string;
}
@Collection()
export class OrderItem extends Item {
  creationDate: Date;
  orderId: string;
  canceledQuantity?: number;
  detail?: Product;
}
