import * as orderServices from 'src/services/order';

export const isOrderOwner = async (req: any, res, next) => {
  try {
    const { uid } = req.token;
    const orderNumber = req.params.orderNumber ?? req.body.payload.orderNumber;

    const isOwner = await orderServices.isOrderOwner({ orderNumber, userId: uid });

    if (!isOwner) {
      throw new Error('You are not the owner of this order');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export const isOrderedFromShop = async (req: any, res, next) => {
  try {
    const { shopId } = req;
    const orderId = req.params.orderId ?? req.body.payload.orderId;

    const isOrdered = await orderServices.isOrderedFromShop({ orderId, shopId });

    if (!isOrdered) {
      throw new Error('This order is not from this shop');
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
