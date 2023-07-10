export enum DeliveryManEvents {
  READY = 'DELIVERY_MAN:ready',
  LOCATION = 'DELIVERY_MAN:location',
  TAKE_ORDER = 'DELIVERY_MAN:takeOrder',
  STATUS = 'DELIVERY_MAN:status',
}

export enum DeliveryManEmits {
  ORDER_TAKEN = 'DELIVERY_MAN:orderTaken',
  CURRENT_LOCATION = 'DELIVERY_MAN:currentLocation',
}
