import * as shopServices from 'src/services/shop';
import * as shopAdminServices from 'src/services/shopAdmin';

const Shop = (io, socket) => {
  const { uid } = socket.request.currentUser;

  const login = async () => {
    const shopAdmin = await shopAdminServices.findByUserId({ userId: uid });
    if (!shopAdmin) {
      return;
    }
    await shopServices.socketLogin({ shopId: shopAdmin.shopId, socketId: socket.id });
  };

  login();
};

export default Shop;
