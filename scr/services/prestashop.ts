import PrestaShopClient from 'src/utils/prestashopClient';
import { formatProduct, formatCategory, formatArrayFilter } from 'src/utils/prestashop';

import { getShopConfig } from 'src/services/shop';

export const getCustomers = async ({ shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({ resource: 'customers' });

    return serviceResponse.customers;
  } catch (err) {
    throw err;
  }
};

export const getCustomerById = async ({ shopId, customerId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({ resource: 'customers', 'filter[id]': customerId });

    return serviceResponse.customers[0];
  } catch (err) {
    throw err;
  }
};

export const getProducts = async ({ shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({ resource: 'products', 'price[price][use_tax]': 1 });

    const products = serviceResponse.products.map(product => formatProduct({ product, shopId, shopConfig }));

    return products;
  } catch (err) {
    throw err;
  }
};

export const getProductById = async ({ productId, shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({ resource: 'products', 'filter[id]': productId, 'price[price][use_tax]': 1 });

    if (!serviceResponse.products) {
      return null;
    }

    const product = formatProduct({ product: serviceResponse.products[0], shopId, shopConfig });

    return product;
  } catch (err) {
    throw err;
  }
};

export const getProductsByIds = async ({ productsIds, shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({
      resource: 'products',
      'filter[id]': formatArrayFilter(productsIds),
      'price[price][use_tax]': 1,
    });

    const products = serviceResponse.products.map(product => formatProduct({ product, shopId, shopConfig }));

    return products;
  } catch (err) {
    throw err;
  }
};

export const getProductsByCategoryId = async ({ categoryId, shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({
      resource: 'products',
      'filter[id_category_default]': categoryId,
      'price[price][use_tax]': 1,
    });

    if (!serviceResponse.products) {
      return null;
    }

    const products = serviceResponse.products.map(product => formatProduct({ product, shopId, shopConfig }));

    return products;
  } catch (err) {
    throw err;
  }
};

export const getCategories = async ({ shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({ resource: 'categories' });

    const categories = serviceResponse.categories.map(category => {
      return formatCategory({ category, shopId, shopConfig });
    });

    return categories;
  } catch (err) {
    throw err;
  }
};

export const getCategoryById = async ({ categoryId, shopId }) => {
  try {
    const shopConfig = await getShopConfig({ shopId });

    const prestashopClient = new PrestaShopClient(shopConfig.url, shopConfig.api_key);
    const serviceResponse = await prestashopClient.get({ resource: 'categories', 'filter[id]': categoryId });

    if (serviceResponse.length > 0) {
      const category = formatCategory(serviceResponse[0]);
      return category;
    }
    return null;
  } catch (err) {
    throw err;
  }
};
