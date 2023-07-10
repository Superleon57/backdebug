import { Collection } from 'fireorm';

@Collection()
export class Company {
  id: string;
  name: string;
}
