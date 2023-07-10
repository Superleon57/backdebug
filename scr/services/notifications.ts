import { Order } from 'src/entities/order';
import { OrderEmits } from 'src/enums/OrderEvents.enum';
import { OrderStatus } from 'src/enums/OrderStatus.enum';
import { PaymentResult } from 'src/enums/PaymentResult.enum';
import * as userServices from 'src/services/user';
import * as orderServices from 'src/services/order';
import ioc from 'src/utils/iocContainer';

export const sendEvent = async ({ event, data, socketId }: { event: string; data: any; socketId?: string }) => {
  const io = ioc.get('socketServer');

  return io.to(socketId).emit(event, data);
};

export const sendOrderToDeliveryMan = async ({ orders, deliveryManSocketId }: { orders: Order[]; deliveryManSocketId: string }) => {
  const io = ioc.get('socketServer');

  if (orders.length === 0) {
    return io.to(deliveryManSocketId).emit('info', { message: 'Aucune commande disponible' });
  }

  const order = orders[0];

  const formatedOrder = await orderServices.formatOrderForDeliveryMan(order);
  io.to(deliveryManSocketId).emit(OrderEmits.READY, formatedOrder);
};

export const sendStatusUpdateToCustomer = async ({ order, newStatus }: { order: Order; newStatus?: OrderStatus }) => {
  const io = ioc.get('socketServer');

  const customerSocket = await userServices.getUserSocket(order.userId);
  if (!customerSocket) {
    return;
  }
  const { socketId } = customerSocket;

  io.to(socketId).emit('ORDER:StatusUpdated', { order, newStatus: newStatus ?? order.status });
};

export const sendPaymentResultToCustomer = async ({ paymentResult, order }: { paymentResult: PaymentResult; order?: Order }) => {
  const io = ioc.get('socketServer');

  const customerSocket = await userServices.getUserSocket(order.userId);
  if (!customerSocket) {
    return;
  }
  const { socketId } = customerSocket;

  io.to(socketId).emit('PAYMENT:result', { order, result: paymentResult });
};
