import { Geopoint } from 'geofire-common';
import * as deliveryManRepository from 'src/repositories/deliveryMan';
import * as shopServices from 'src/services/shop';
import * as MeiliSearch from 'src/services/meilisearch';
import { DeliveryMan } from 'src/entities/deliveryMan';
import config from 'src/config';

export const getDeliveryMan = async ({ userId }: { userId: string }) => {
  return await deliveryManRepository.findOneById(userId);
};

export const getDeliveryManByOrderNumber = async orderNumber => {
  return await deliveryManRepository.getDeliveryManByOrderNumber(orderNumber);
};

export const deliveryMansAroundShop = async ({ shopId }) => {
  const shop = await shopServices.getShop({ shopId });
  const { lat, lng } = shop._geo;

  const index = MeiliSearch.deliveryManIndex();
  const results = await index.search('', {
    filter: [
      `_geoRadius(${lat}, ${lng}, ${config.DELIVERYMAN_RADIUS})`,
      'isReady=true',
      'orderNumber IS NULL OR orderNumber NOT EXISTS',
      'socketId IS NOT NULL',
    ],
    sort: [`_geoPoint(${lat}, ${lng}):asc`],
    limit: 10,
  });

  return results.hits as DeliveryMan[];
};

export const countAroundShop = async ({ shopId }) => {
  const shop = await shopServices.getShop({ shopId });
  const { lat, lng } = shop._geo;

  const index = MeiliSearch.deliveryManIndex();
  const results = await index.search('', {
    filter: [`_geoRadius(${lat}, ${lng}, ${config.DELIVERYMAN_RADIUS})`, 'socketId!=null'],
    sort: [`_geoPoint(${lat}, ${lng}):asc`],
  });

  const ready = results.hits.filter(deliveryMan => deliveryMan.isReady === true).length;

  return {
    ready,
    total: results.hits.length,
  };
};

export const getReadyAroundShop = async ({ shopId }) => {
  const deliveryMans = await deliveryMansAroundShop({ shopId });
  const readyDeliveryMans = deliveryMans.filter(deliveryMan => deliveryMan.isReady === true);
  return readyDeliveryMans;
};

export const setLocation = async ({ uid, location }) => {
  const localisation: Geopoint = [location.latitude, location.longitude];
  await deliveryManRepository.setLocation({ uid, localisation });
};

export const ready = async ({ uid, status, socketId = null }) => {
  await deliveryManRepository.ready({ uid, status, socketId });
};

export const disconnect = async ({ uid }) => {
  await deliveryManRepository.disconnect({ uid });
};

export const takeOrder = async ({ uid, orderNumber }) => {
  await deliveryManRepository.takeOrder({ uid, orderNumber });
};

export const addDeclinedOrder = async ({ deliveryManId, orderId }) => {
  await deliveryManRepository.addDeclinedOrder({ deliveryManId, orderId });
};
