import { SubCollection, ISubCollection, Collection } from 'fireorm';

@Collection()
export class Category {
  id: string;
  name: string;
  image: string;
  shopId?: string;
  type?: string;
}
