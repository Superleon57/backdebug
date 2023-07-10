import { getShopRef } from './shop';

export const getSalesRef = shopId => {
  return getShopRef().doc(shopId).collection('Sales');
};

export const getSaleByDateRef = (shopId, date) => {
  return getShopRef().doc(shopId).collection('SalesByDate').doc(date).collection('Sales');
};

export const getSales = async (shopId: string) => {
  const ref = getSalesRef(shopId);
  const query = await ref.get();

  if (query.empty) {
    return;
  }

  const sales = query.docs.map(doc => doc.data());

  return sales;
};

export const getSale = async (shopId: string, saleId: string) => {
  const ref = getSalesRef(shopId);
  const query = await ref.doc(saleId).get();

  if (!query.exists) {
    return;
  }

  const sale = query.data();

  return sale;
};

export const addSale = async (shopId: string, itemId: string) => {
  const ref = getSalesRef(shopId);
  const saleRef = ref.doc(itemId);

  const newSale = await saleRef.update({
    itemId,
  });

  return newSale.id;
};

export const getTopTenSalesByDate = async (shopId: string, date: string) => {
  const ref = getSaleByDateRef(shopId, date);
  const query = await ref.orderBy('quantity').limit(10).get();

  if (query.empty) {
    return;
  }

  const sales = query.docs.map(doc => {
    const data = doc.data();
    const id = doc.id;

    return { id, ...data };
  });

  return sales;
};

export const getSalesByDate = async (shopId: string, date: string) => {
  const ref = getSaleByDateRef(shopId, date);
  const query = await ref.get();

  if (!query.exists) {
    return;
  }

  const sales = query.data();

  return sales;
};
