import { Collection, SubCollection, ISubCollection } from 'fireorm';

@Collection()
export class Adress {
  id: string;
  addr1: string;
  addr2: string | null;
  cp: string;
  ville: string;
}

export class Address {
  address: string;
  city: string;
  country: string;
  countryName: string;
  department: string;
  googlePlaceId: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  region: string;
}
