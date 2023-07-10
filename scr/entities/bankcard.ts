import { Collection, SubCollection, ISubCollection } from 'fireorm';

@Collection()
export class BankCard {
  id: string;
  number: string;
  month: string;
  year: string;
  ownerName: string;
  colorHex: string;
}
