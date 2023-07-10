import { MeiliSearch } from 'meilisearch';
import config from '../config';

export const client = new MeiliSearch({
  host: config.MEILISEARCH_HOST,
  apiKey: config.MEILISEARCH_MASTER_KEY,
});

export const productsIndex = () => {
  return client.index('liv');
};

export const ordersIndex = () => {
  return client.index('Orders');
};

export const shopsIndex = () => {
  return client.index('Shops');
};

export const variantsIndex = () => {
  return client.index('Variants');
};

export const deliveryManIndex = () => {
  return client.index('deliveryMans');
};
