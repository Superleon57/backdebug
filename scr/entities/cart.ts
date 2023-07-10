import { SubCollection, ISubCollection, Collection } from 'fireorm';
import { Item } from './item';

@Collection()
export class Cart {
  id: string;
  userId: string;
  @SubCollection(Item)
  Items?: ISubCollection<Item>;
  subTotal: number;
  totalItems: number;
  shopId?: string;
  numberOfItems: number;
  returnInsurance: boolean;
  returnInsurancePrice: number;
  distance?: {
    duration: string;
    distance: string;
    distanceValue: number;
  };
}
