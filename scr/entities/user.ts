import { Collection, SubCollection, ISubCollection } from 'fireorm';
import { Order } from './order';
import { Adress } from './adress';
import { BankCard } from './bankcard';
import { Roles } from 'src/enums/rbac.enum';

@Collection()
export class user {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  authProvider: string;
  photo: string | null;
  address: Adress;
  role: Roles;
  bankcards: BankCard[];
  threeLastPositions: any;
}
