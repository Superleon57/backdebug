import { SubCollection, ISubCollection, Collection } from 'fireorm';
import { Review } from './review';

@Collection()
export class Product {
  id: string;
  shopId: string;
  title: string;
  description: string;
  price: number;
  manufacturer: string;
  default_category: string;
  categories: Array<string>;
  imagesURL: Array<string>;
  @SubCollection(Review)
  Reviews: ISubCollection<Review>;
  quantity: number;
  hasVariants: boolean;

  Variants: Variant[];
  hidden: boolean;
  archived: boolean;
}

export interface Variant {
  id: string;
  color: { name: string; value: string };
  size: { name: string; value: string };
  quantity: number;
}
