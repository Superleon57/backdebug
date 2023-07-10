import { Collection } from 'fireorm';

@Collection()
export class ShopAdmin {
  id: string;
  userId: string;
  shopId: string;
}
