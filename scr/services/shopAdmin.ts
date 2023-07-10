import { ShopAdmin } from 'src/entities/shopAdmin';
import * as shopAdminRepository from 'src/repositories/shopAdmin';
import * as orderService from 'src/services/order';
import * as userService from 'src/services/user';
import { colorNotFound, sizeNotFound } from 'src/utils/errors';

export const findByUserId = async ({ userId }): Promise<ShopAdmin> => {
  const userAdmin = await shopAdminRepository.findOne({ userId });

  return userAdmin;
};

export const createShopAdmin = async ({ shopId, userId }) => {
  try {
    if (await findByUserId({ userId })) {
      throw new Error('User is already an admin of a shop');
    }

    const newShopAdmin = await shopAdminRepository.create({ shopId, userId });

    return {
      newShopAdmin,
    };
  } catch (err) {
    throw err;
  }
};

export const isShopAdmin = async ({ userId, shopId }) => {
  const userAdmin = await findByUserId({ userId });

  if (userAdmin && userAdmin.shopId === shopId) {
    return true;
  }

  return false;
};

export const getCustomers = async ({ shopId }) => {
  const orders = await orderService.getAllOrders({ shopId });

  const usersIdsSet = new Set();
  orders.forEach(order => {
    usersIdsSet.add(order.userId);
  });

  const usersIds = Array.from(usersIdsSet);

  const users = await Promise.all(
    usersIds.map(async (userId: string) => {
      const user = await userService.getUserByUid(userId);
      return user;
    })
  );

  return users;
};

export const createColor = async ({ shopId, name, value }) => {
  const color = await shopAdminRepository.createColor({ shopId, name, value });

  return color;
};

export const createSize = async ({ shopId, name, value }) => {
  const size = await shopAdminRepository.createSize({ shopId, name, value });

  return size;
};

export const getColor = async ({ shopId, name }) => {
  return await shopAdminRepository.getColor({ shopId, name });
};

export const getSize = async ({ shopId, name }) => {
  return await shopAdminRepository.getSize({ shopId, name });
};

export const getColors = async ({ shopId }) => {
  const colors = await shopAdminRepository.getColors({ shopId });

  return colors;
};

export const getSizes = async ({ shopId }) => {
  const sizes = await shopAdminRepository.getSizes({ shopId });

  return sizes;
};

export const removeColor = async ({ shopId, name }) => {
  const color = await getColor({ shopId, name });

  if (!color) {
    throw colorNotFound;
  }

  await shopAdminRepository.removeColor({ shopId, colorId: color.id });

  return color;
};

export const removeSize = async ({ shopId, name }) => {
  const size = await getSize({ shopId, name });

  if (!size) {
    throw sizeNotFound;
  }

  await shopAdminRepository.removeSize({ shopId, sizeId: size.id });

  return size;
};
