import { SubCollection, ISubCollection, Collection, Type } from 'fireorm';

import { Config } from './config';
import { MeiliSearchGeo } from 'src/types/Coordinates';
import { Address } from './adress';
import { Timestamp } from 'firebase-admin/firestore';

type slot = {
  day: string;
  isClosed?: boolean;
  isOpenAllDay?: boolean;
  slots?: {
    start: string;
    end: string;
  }[];
};

@Collection()
export class Shop {
  id: string;
  name: string;
  description: string;
  address: Address;
  disabled: boolean;
  image: string;
  logo: string;
  openingTimes: slot[];
  slogan: string;
  owner: string;
  _geo: MeiliSearchGeo;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
