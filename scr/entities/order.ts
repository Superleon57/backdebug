import { Collection } from 'fireorm';
import { Timestamp } from '@google-cloud/firestore';

import { OrderStatus } from 'src/enums/OrderStatus.enum';
import { Geoloc, MeiliSearchGeo } from 'src/types/Coordinates';
import { user } from './user';
import { CalculatedFees } from './Fees';

export interface ShopOrder {
  id: string;
  shopId: string;
  orderId: string;
  userId: string;
  status: OrderStatus;
  total: number;
}

@Collection()
export class UsersOrders {
  id: string;
  userId: string;
  shopId: string;
  orderId: string;
  creationDate: Timestamp;
  deliveryManId?: string;
  reward?: number;
}

export type PaymentResult = {
  amount: string;
  auto: string;
  error: string;
};

@Collection()
export class Order {
  id: string;
  shopId: string;
  orderNumber: string;
  userId: string;
  creationDate: Timestamp;
  updateDate?: Timestamp;
  code?: number;
  status: OrderStatus;
  total: number;

  deliveryAddress: {
    addr1: string;
    addr2: string;
    cp: string;
    position: Geoloc;
    libelle: string;
  };
  deliveryManId?: string;
  isAGift: boolean;

  paymentDate?: Timestamp;
  deliveryStartDate?: Timestamp;
  deliveryDate?: Timestamp;
  takingDate?: Timestamp;
  assignedDate?: Timestamp;
  canceledDate?: Timestamp;

  cancelReason?: string;

  paymentResult?: PaymentResult;

  distance: {
    duration: string;
    distance: string;
    distanceValue: number;
  };

  fees: CalculatedFees;
  _geo?: MeiliSearchGeo;

  declinedDeliveryManIds?: string[];
}

export interface OrderSafeData extends Omit<Order, 'userId' | 'code' | 'totalPerShop'> {}

type OrderWithUserInfo = Order & { user: user };

export interface OrderItem {
  id: string;
  orderId: string;
  price: number;
  productId: string;
  shopId: string;
  quantity: number;
  canceledQuantity?: number;
}

export interface CanceledItem extends OrderItem {
  reason: string;
  refund: number;
  refundDate: Timestamp;
}

export interface ReturnedItem extends OrderItem {
  reason: string;
  refund: number;
  refundDate: Timestamp;
}
