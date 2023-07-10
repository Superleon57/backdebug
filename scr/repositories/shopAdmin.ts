import { getRepository } from 'fireorm';
import { ShopAdmin } from 'src/entities/shopAdmin';
import ioc from 'src/utils/iocContainer';

export const getShopRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('Shops');
};

export const getShopColorsRef = ({ shopId }) => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('Shops').doc(shopId).collection('Colors');
};

export const getShopAdminRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('ShopAdmins');
};

export const getShopSizesRef = ({ shopId }) => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('Shops').doc(shopId).collection('Sizes');
};

export const create = async ({ shopId, userId }) => {
  const shopAdminRef = getShopAdminRef();

  const shopAdminDoc = shopAdminRef.doc(userId);

  const shopAdmin = {
    id: userId,
    shopId,
    userId,
  };

  await shopAdminDoc.set(shopAdmin);

  return shopAdmin;
};

export const findOne = async ({ userId }) => {
  const shopAdminRef = getShopAdminRef();
  const shopAdmin = await shopAdminRef.doc(userId).get();

  return shopAdmin.data() as ShopAdmin;
};

export const createColor = async ({ shopId, name, value }) => {
  const shopColorRef = getShopColorsRef({ shopId }).doc();
  const color = { id: shopColorRef.id, name, value };

  await shopColorRef.set(color);

  return color;
};

export const createSize = async ({ shopId, name, value }) => {
  const shopSizeRef = getShopSizesRef({ shopId }).doc();
  const size = { id: shopSizeRef.id, name, value };

  await shopSizeRef.set(size);

  return size;
};

export const getColor = async ({ shopId, name }) => {
  const shopColorRef = getShopColorsRef({ shopId });
  const color = await shopColorRef.where('name', '==', name).get();
  const colorDoc = color.docs[0];

  if (!colorDoc) {
    return null;
  }

  return colorDoc.data();
};

export const getSize = async ({ shopId, name }) => {
  const shopSizeRef = getShopSizesRef({ shopId });
  const sizeQuery = await shopSizeRef.where('name', '==', name).get();
  const sizeDoc = sizeQuery.docs[0];

  if (!sizeDoc) {
    return null;
  }

  return sizeDoc.data();
};

export const getSizes = async ({ shopId }) => {
  const shopSizeRef = getShopSizesRef({ shopId });
  const sizes = await shopSizeRef.get();

  return sizes.docs.map(doc => doc.data());
};

export const getColors = async ({ shopId }) => {
  const shopColorRef = getShopColorsRef({ shopId });
  const colors = await shopColorRef.get();

  return colors.docs.map(doc => doc.data());
};

export const removeColor = async ({ shopId, colorId }) => {
  const shopColorRef = getShopColorsRef({ shopId }).doc(colorId);

  await shopColorRef.delete();
};

export const removeSize = async ({ shopId, sizeId }) => {
  const shopSizeRef = getShopSizesRef({ shopId }).doc(sizeId);

  await shopSizeRef.delete();
};
