import { Server } from 'socket.io';
import isAuth from 'src/middlewares/isAuth';
import getUser from 'src/middlewares/getUser';
import * as shopAdminServices from 'src/services/shopAdmin';
import * as deliveryManServices from 'src/services/deliveryMan';
import * as orderServices from 'src/services/order';

import registerDeliveryManHandlers from './deliveryManHandler';
import registerShopHandlers from './shopHandler';
import registerCustomerHandlers from './customerHandler';
import registerOrderHandlers from './orderHandler';
import { Roles } from 'src/enums/rbac.enum';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from 'src/types/socket.io';

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

export default httpServer => {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
      origin: '*',
    },
  });

  const handleRole = socket => {
    const { currentUser } = socket.request;

    if (currentUser?.shopAdmin) {
      return registerShopHandlers(io, socket);
    }

    if (currentUser?.role === Roles.LIVREUR) {
      return registerDeliveryManHandlers(io, socket);
    }

    if (currentUser?.role === Roles.USER) {
      return registerCustomerHandlers(io, socket);
    }
  };

  const onConnection = socket => {
    const { currentUser } = socket.request;

    handleRole(socket);
    registerOrderHandlers(io, socket);

    socket.on('connect_error', err => {
      console.log(err.message);
    });

    socket.emit('userInfo', {
      socketId: socket.id,
      user: currentUser,
    });
  };

  const loginToShopRoom = async ({ socket }) => {
    const { currentUser } = socket.request;

    const shopAdmin = await shopAdminServices.findByUserId({ userId: currentUser?.id });

    if (!shopAdmin) {
      return;
    }

    socket.join('SHOP_ROOM');

    currentUser.shopAdmin = shopAdmin;
  };

  const loginToDeliveryManRoom = async ({ socket }) => {
    const { currentUser } = socket.request;

    const deliveryMan = await deliveryManServices.getDeliveryMan({ userId: currentUser?.id });

    if (!deliveryMan) {
      return;
    }
    const assignedOrder = await orderServices.getDeliveryManCurrentOrderData({ deliveryManId: currentUser.id });
    socket.data = { ...socket.data, deliveryMan, assignedOrder };
    socket.join('DELIVERY_MAN_ROOM');
  };

  io.on('connection', onConnection);

  io.use(wrap(isAuth));
  io.use(wrap(getUser));

  io.use(async (socket, next) => {
    try {
      const { currentUser } = socket.request;

      if (!currentUser) {
        return next(new Error('Not authorized'));
      }

      if (currentUser?.role === Roles.ADMIN || currentUser?.role === Roles.SUPERVISOR) {
        await loginToShopRoom({ socket });

        return next();
      }

      if (currentUser?.role === Roles.LIVREUR) {
        await loginToDeliveryManRoom({ socket });

        return next();
      }

      if (currentUser?.role === Roles.USER) {
        socket.join('CUSTOMERS_ROOM');

        return next();
      }
    } catch (err) {
      console.log(err);
      return next(err);
    }
  });

  return io;
};
