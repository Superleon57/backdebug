export enum OrderStatus {
  WAITING_FOR_PAYMENT = 'waitingForPayment',
  PAID = 'paid',
  FAILED = 'failed',
  ASSIGNED_TO_DELIVERY_MAN = 'assignedToDeliveryMan',
  WAITING_FOR_DELIVERY_MAN = 'waitingForDeliveryMan',
  DELIVERY_STARTING = 'deliveryStarting',
  DELIVERY_PROCESSING = 'deliveryProcessing',
  DELIVERY_ALMOST_ARRIVED = 'deliveryAlmostArrived',
  DELIVERY_ARRIVED = 'deliveryArrived',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  TIMED_OUT = 'timedOut',
}
