import { Geoloc } from 'src/types/Coordinates';

export interface DeliveryMan {
  deliveryManId: string;
  isReady: boolean;
  socketId: string;
  localisation?: Geoloc;
  orderNumber?: string;
}
