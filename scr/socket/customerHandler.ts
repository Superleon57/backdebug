import { CustomerEvents, CustomerEmits } from 'src/enums/CustomerEvents.enum';
import * as userServices from 'src/services/user';

const customer = (io, socket) => {
  const { uid } = socket.request.currentUser;

  const login = async () => {
    await userServices.socketLogin({ uid, socketId: socket.id });
  };

  // socket.on(CustomerEvents.LOGIN, login);
  login();
};

export default customer;
