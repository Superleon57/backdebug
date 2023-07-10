import { Roles } from 'src/enums/rbac.enum';
import * as deliveryManServices from 'src/services/deliveryMan';
import * as orderServices from 'src/services/order';
import * as userServices from 'src/services/user';
import * as shopService from 'src/services/shop';
import { DeliveryManEvents, DeliveryManEmits } from 'src/enums/DeliveryManEvents.enum';
import * as notifications from 'src/services/notifications';
import { Server } from 'socket.io';
import { OrderStatus } from 'src/enums/OrderStatus.enum';
import { getDistance } from 'src/services/maps';
import { Order } from 'src/entities/order';
import { OrderEmits } from 'src/enums/OrderEvents.enum';

const deliveryMan = (io: Server, socket) => {
  const { uid, assignedOrderId } = socket.request.currentUser;

  const deliveryManData = socket.data.deliveryMan;

  const sendEventToDeliveryMan = async (event: string, data: any) => {
    socket.emit(event, data);
  };

  const sendEventToEveryOne = async (event: string, data: any) => {
    io.emit(event, data);
  };

  const sendEventBySocketId = async (socketId: string, event: string, data: any) => {
    io.to(socketId).emit(event, data);
  };

  const setAssignedOrder = ({ order }: { order: Order }) => {
    socket.data.assignedOrder = order;
  };

  const getAssignedOrder = (): Order => {
    return socket.data.assignedOrder;
  };

  const ready = async args => {
    const { status } = args;
    const deliveryMan = await deliveryManServices.getDeliveryMan({ userId: uid });

    if (!deliveryMan) {
      return sendEventToDeliveryMan('error', { message: 'Profil livreur introuvable' });
    }

    await deliveryManServices.ready({ uid, status, socketId: socket.id });
    const orders = await orderServices.getOrdersAroundOfDeliveryMan(deliveryMan);

    if (orders.length === 0) {
      return sendEventToDeliveryMan('info', { message: 'Aucune commande disponible' });
    }

    const order = orders[0];

    const formatedOrder = await orderServices.formatOrderForDeliveryMan(order);
    sendEventToDeliveryMan(OrderEmits.READY, formatedOrder);
  };

  const notReady = async () => {
    await deliveryManServices.ready({ uid, status: false });
  };

  const checkDeliveryManAvailability = async uid => {
    const order = await orderServices.getDeliveryManCurrentOrder({ deliveryManId: uid });
    if (order) {
      sendEventToDeliveryMan('success', { orderNumber: order.orderNumber, message: 'Vous avez déjà une commande en cours' });

      return true;
    }
    return false;
  };

  const checkOrderAvailability = async orderNumber => {
    const order = await orderServices.getOrderByOrderNumber(orderNumber);
    if (orderServices.isOrderAssigned(order)) {
      sendEventToDeliveryMan('error', { message: 'Cette commande est déjà prise en charge', orderNumber });
      return true;
    }
    return false;
  };

  const sendOrderTakenNotification = async ({ orderNumber }) => {
    const orders = await orderServices.getOrdersByOrderNumber(orderNumber);
    orders.map(order => (order.status = OrderStatus.ASSIGNED_TO_DELIVERY_MAN));
    const order = orders[0];
    setAssignedOrder({ order });

    const customerSocket = await userServices.getUserSocket(order.userId);
    if (!customerSocket) {
      return;
    }
    const { socketId } = customerSocket;

    const deliveryMan = await userServices.getDeliveryManPublicData(uid);
    const shopSocketId = await shopService.getShopSocketId(order.shopId);

    sendEventBySocketId(socketId, DeliveryManEmits.ORDER_TAKEN, { order, deliveryMan });

    if (shopSocketId) {
      sendEventBySocketId(shopSocketId, DeliveryManEmits.ORDER_TAKEN, { order, deliveryMan });
    }
  };

  const takeOrder = async args => {
    const { orderNumber } = args;

    const deliveryManUnavailable = await checkDeliveryManAvailability(uid);
    if (deliveryManUnavailable) {
      return;
    }

    const orderUnavailable = await checkOrderAvailability(orderNumber);
    if (orderUnavailable) {
      return;
    }

    await deliveryManServices.takeOrder({ uid, orderNumber });
    await orderServices.assignOrderToDeliveryMan({ orderNumber, deliveryManId: uid });

    await sendOrderTakenNotification({ orderNumber });

    sendEventToDeliveryMan('success', { orderNumber, message: 'Commande prise en charge' });
  };

  /* TODO:
    - Add limitation of getDistance calls
  */
  const sendLocationToCustomer = async ({ location }) => {
    const order = getAssignedOrder();

    if (!order) {
      return;
    }

    const customerSocket = await getSocketByCustomerId(order.userId);

    if (!customerSocket) {
      return;
    }

    const distance = await getDistance(location, order.deliveryAddress.position);

    customerSocket.emit(DeliveryManEmits.CURRENT_LOCATION, { location, distance });
  };

  /* TODO:
    - Add location validation (lat, lng) 
  */
  const setLocation = async args => {
    try {
      const { location } = args;
      await deliveryManServices.setLocation({ uid, location });

      const assignedOrder = getAssignedOrder();

      if (assignedOrder) {
        //   await orderServices.setDeliveryManPath({ orderId: assignedOrder.id, location });
        sendLocationToCustomer({ location });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const disconnect = async () => {
    if (socket.request?.currentUser.role === Roles.LIVREUR) {
      deliveryManServices.disconnect({ uid });
    }
  };

  const getSocketByCustomerId = async id => {
    const customers = await io.of('/').in('CUSTOMERS_ROOM').fetchSockets();

    const customerSocket = customers.find(customer => customer.request?.currentUser.id === id);

    return customerSocket;
  };

  const sendSocketInfo = async () => {
    socket.emit('socketInfo', { socketId: socket.id });
  };

  const getStatus = async () => {
    const deliveryMan = await deliveryManServices.getDeliveryMan({ userId: uid });
    socket.emit(DeliveryManEvents.STATUS, { isReady: deliveryMan?.isReady });
  };

  socket.on(DeliveryManEvents.READY, ready);
  socket.on(DeliveryManEvents.LOCATION, setLocation);
  socket.on(DeliveryManEvents.TAKE_ORDER, takeOrder);
  socket.on(DeliveryManEvents.STATUS, getStatus);
  socket.on('socketInfo', sendSocketInfo);
  socket.on('disconnect', disconnect);
};

export default deliveryMan;
