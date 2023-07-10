import * as MeiliSearch from 'src/services/meilisearch';
import * as shopRepository from 'src/repositories/shop';
import { shopAddressNotValid, shopOpeningTimesNotValid, undefinedShopException } from 'src/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { extractShopInfo } from 'src/utils/shop';
import config from 'src/config';

export const createShop = async ({ shop }) => {
  try {
    const newShop = await shopRepository.createShop(shop);

    return newShop;
  } catch (err) {
    throw err;
  }
};

export const updateShopInfo = async ({ shopId, name, description, slogan }) => {
  try {
    const shop = {
      name,
      description,
      slogan,
    };

    await shopRepository.update(shopId, shop);

    return shop;
  } catch (err) {
    throw err;
  }
};
export const updateShopAddress = async ({ shopId, address }) => {
  try {
    const meilisearchGeo = {
      lat: address.latitude,
      lng: address.longitude,
    };
    await shopRepository.update(shopId, { address, _geo: meilisearchGeo });
    return address;
  } catch (err) {
    throw err;
  }
};

export const getShop = async ({ shopId }) => {
  const shop = await shopRepository.findOneById({ shopId });
  if (!shop) {
    throw undefinedShopException;
  }

  return shop;
};

export const getAll = async () => {
  return await shopRepository.findAll();
};
/* TODO:
  - Add pagination
*/
export const getAllEnabled = async () => {
  const index = MeiliSearch.shopsIndex();

  const results = await index.search('', {
    filter: ['disabled=false'],
    limit: 1000,
  });

  return results.hits.map(extractShopInfo);
};

type ShopSearchFilters = {
  latitude: number;
  longitude: number;
  distance: number;
  hitsPerPage: number;
  page: number;
};

export const searchShopsByLocation = async ({ latitude, longitude, distance, hitsPerPage = 20, page = 1 }: ShopSearchFilters) => {
  const index = MeiliSearch.shopsIndex();
  const results = await index.search('', {
    filter: [`_geoRadius(${latitude}, ${longitude}, ${distance * 1000})`, 'disabled=false'],
    sort: [`_geoPoint(${latitude}, ${longitude}):asc`],
    hitsPerPage,
    page,
  });

  results.hits = results.hits.map(extractShopInfo);

  return results;
};

export const getShopIdsByLocation = async ({ latitude, longitude, distance = 5 }) => {
  const index = MeiliSearch.shopsIndex();

  const results = await index.search('', {
    filter: [`_geoRadius(${latitude}, ${longitude}, ${distance * 1000})`, 'disabled=false'],
    sort: [`_geoPoint(${latitude}, ${longitude}):asc`],
    limit: 1000,
    attributesToRetrieve: ['id'],
  });

  return results.hits.map(hit => hit.id);
};

export const getShopOpeningTimesByLocation = async ({ latitude, longitude, distance = 5 }) => {
  const index = MeiliSearch.shopsIndex();

  const results = await index.search('', {
    filter: [`_geoRadius(${latitude}, ${longitude}, ${distance * 1000})`, 'disabled=false'],
    sort: [`_geoPoint(${latitude}, ${longitude}):asc`],
    limit: 1000,
    attributesToRetrieve: ['id', 'openingTimes'],
  });

  return results.hits;
};

export const createShopConfig = async ({ shopId, newConfig }) => {
  await shopRepository.update(shopId, { config: newConfig });
};

export const getShopConfig = async ({ shopId }) => {
  const shop = await getShop({ shopId });
  return shop.Config;
};

export const updateOpeningTimes = async ({ shopId, newOpeningTimes }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  newOpeningTimes = newOpeningTimes.map((openingTime, index) => {
    const slot = {
      day: days[index],
    } as any;
    if (openingTime.isClosed) {
      slot.isClosed = true;
      return slot;
    }

    slot.slots = openingTime.slots.map(slot => {
      return {
        id: uuidv4(),
        opening: slot.opening,
        closing: slot.closing,
      };
    });
    return slot;
  });

  return shopRepository.update(shopId, { openingTimes: newOpeningTimes });
};

export const getOpeningTime = async ({ shopId }) => {
  const shop = await getShop({ shopId });
  return shop.openingTimes;
};

export const updateMessagingToken = async ({ shopId, token }) => {
  return await shopRepository.update(shopId, { messagingToken: token });
};

export const getMessagingToken = async ({ shopId }) => {
  const shop = await getShop({ shopId });
  return shop.messagingToken;
};

export const getShopSocketId = async (shopId: string) => {
  return shopRepository.getShopSocketId(shopId);
};

export const socketLogin = ({ shopId, socketId }) => {
  return shopRepository.socketLogin(shopId, socketId);
};

export const updateShopImage = async ({ shopId, imageUrl }) => {
  return await shopRepository.update(shopId, { image: imageUrl });
};

export const updateShopLogo = async ({ shopId, imageUrl }) => {
  return shopRepository.update(shopId, { logo: imageUrl });
};

export const getShopPublicInfo = async ({ shopId }) => {
  const shop = await getShop({ shopId });

  return extractShopInfo(shop);
};

export const getShopsPublicInfo = async (shopIds: string[]) => {
  const index = MeiliSearch.shopsIndex();

  const shopsQuery = shopIds.map(shopId => `id = ${shopId}`);

  const results = await index.search('', { filter: [shopsQuery], limit: 50 });

  return results.hits.map(extractShopInfo);
};

export const search = async ({ query, position, hitsPerPage, page }) => {
  const index = MeiliSearch.shopsIndex();
  const filter: string[] = [];
  const sort: string[] = [];

  if (position) {
    const { latitude, longitude } = position;
    filter.push(`_geoRadius(${latitude}, ${longitude}, ${config.DELIVERY_RADIUS})`);
    sort.push(`_geoPoint(${latitude}, ${longitude}):asc`);
  }

  const results = await index.search(query, {
    filter,
    sort,
    limit: 20,
    hitsPerPage,
    page,
  });

  results.hits = results.hits.map(extractShopInfo);

  return results;
};

export const isShopAddressDefined = shop => {
  if (!shop.address || !shop.address.address || !shop.address.latitude || !shop.address.longitude) {
    return false;
  }

  return true;
};

export const shopCanBeEnabled = async ({ shopId }) => {
  const shop = await getShop({ shopId });

  if (!isShopAddressDefined(shop)) {
    throw shopAddressNotValid;
  }

  if (!shop.openingTimes) {
    throw shopOpeningTimesNotValid;
  }

  return true;
};

export const updateShopStatus = async ({ shopId, disabled }) => {
  return await shopRepository.update(shopId, { disabled });
};
