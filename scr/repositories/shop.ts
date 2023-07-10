var geofire = require('geofire-common');

import ioc from 'src/utils/iocContainer';
import { Shop } from 'src/entities/shop';
import { Geopoint } from 'src/types/Geopoint';

export const getShopRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('Shops') as FirebaseFirestore.CollectionReference<Shop>;
};

export const findOneById = async ({ shopId }) => {
  const shopRef = getShopRef();
  const shop = await shopRef.doc(shopId).get();

  const shopData = shop.data();
  return shopData;
};

export const findAll = async () => {
  const shopRef = getShopRef();
  const shops = await shopRef.get();

  return shops.docs.map(doc => doc.data() as Shop);
};

export const createShop = async newShop => {
  const shopRef = getShopRef().doc();

  const shop = {
    id: shopRef.id,
    name: newShop.name,
    owner: newShop.owner,
    disabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await shopRef.set(shop);

  return shop;
};

export const update = async (shopId: string, data: any) => {
  const shopRef = getShopRef().doc(shopId);

  data.updatedAt = new Date();

  await shopRef.set(data, { merge: true });

  return data;
};

export const deleteShop = async ({ idShop }) => {
  const shopRepository = ioc.get('shopRepository');
  return await shopRepository.delete({ id: idShop });
};

export const socketLogin = (shopId, socketId) => {
  const db = ioc.get('db');
  const shopRef = db.ref(`shops/${shopId}`);
  shopRef.update({ socketId });
};

export const getShopSocketId = async (shopId: string): Promise<string | null> => {
  const db = ioc.get('db');
  const shopRef = db.ref(`shops/${shopId}`);

  return new Promise((resolve, reject) => {
    shopRef.once('value', snapshot => {
      const shop = snapshot.val();

      if (shop?.socketId) {
        resolve(shop.socketId);
      }
      resolve(null);
    });
  });
};
