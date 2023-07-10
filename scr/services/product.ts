import { Item } from 'src/entities/item';
import * as productRepository from 'src/repositories/product';
import * as salesService from 'src/services/Sales';
import * as shopsService from 'src/services/shop';
import * as MeiliSearch from 'src/services/meilisearch';
import { isShopOpen } from 'src/utils/shop';

export const create = async ({ shopId, product }) => {
  if (product.hasVariants) {
    delete product.quantity;
  }
  const newProduct = await productRepository.createProduct(shopId, product);

  if (product.hasVariants) {
    const Variants = await productRepository.createVariants(newProduct.id, product.Variants);
    return { ...newProduct, Variants };
  }

  return { ...newProduct };
};

export const update = async ({ productId, newData }) => {
  if (newData.hasVariants) {
    delete newData.quantity;
  }

  const oldProduct = await getProductById({ productId });
  const updatedProduct = await productRepository.updateProduct(oldProduct, newData);
  const Variants = await productRepository.createVariants(oldProduct.id, newData.Variants);

  return { ...updatedProduct, Variants };
};

export const concatVariants = async ({ products }) => {
  const productVariantsQuery = products.hits.map(product => `productId = ${product.id}`);

  const variantsIndex = MeiliSearch.variantsIndex();

  const variants = await variantsIndex.search('', { filter: [productVariantsQuery], limit: 1000 });

  products.hits.map(product => {
    if (product.hasVariants) {
      product.Variants = variants.hits.filter(variant => variant.productId === product.id);
    }
  });

  return products.hits;
};

/* 
  TODO:
  - Add pagination
  - Add filters
  - Add sorting
  - Add search

*/
export const getProducts = async ({ shopId }) => {
  const products = await MeiliSearch.productsIndex().search('', {
    filter: `shopId = ${shopId} AND (archived NOT EXISTS OR archived != true) AND (hidden NOT EXISTS OR hidden != true) AND (quantity > 0 OR hasVariants = true)`,
    sort: ['title:asc'],
    limit: 1000,
  });

  const productWithVariants = await concatVariants({ products });

  return productWithVariants;
};

/* 
  For admin panel only
*/
export const getShopProducts = async ({ shopId }) => {
  const products = await MeiliSearch.productsIndex().search('', {
    filter: `shopId = ${shopId} AND (archived NOT EXISTS OR archived != true)`,
    sort: ['title:asc'],
    limit: 1000,
  });

  const productWithVariants = await concatVariants({ products });

  return productWithVariants;
};

export const getProductById = async ({ productId }) => {
  const product = await productRepository.findOneProductById(productId);

  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

export const getProductsByIds = ({ productsIds }) => {
  return productRepository.findProductsByIds(productsIds);
};

export const getProductsByCategoryId = async ({ categoryId }) => {
  return await productRepository.getProductsByCategoryId({ categoryId });
};

export const getProductVariant = async ({ productId, variantId }) => {
  const product = await getProductById({ productId });
  const variant = product.Variants.find(variant => variant.id === variantId);

  if (!variant) {
    throw new Error('Variant not found');
  }

  return variant;
};

export const getTopTenSalesProducts = async ({ shopId }) => {
  const topTenSales = await salesService.getTodayTopTenSales(shopId);
  if (!topTenSales) {
    return [];
  }
  const productsIds = topTenSales.map(sale => sale.id);

  const products = await getProductsByIds({ productsIds });

  products.map(product => {
    const sales = topTenSales.find(sale => sale.id === product.id);
    product.sales = sales.quantity;
  });

  return products;
};

type ShopSearchFilters = {
  query: string;
  shopId?: string;
  categoryId?: string;
  hitsPerPage: number;
  page: number;
  position?: {
    latitude: number;
    longitude: number;
  };
};

export const search = async ({ query, shopId, categoryId, hitsPerPage = 20, page = 1, position }: ShopSearchFilters) => {
  const index = MeiliSearch.productsIndex();
  const filters = [`(archived NOT EXISTS OR archived != true)`, `(hidden NOT EXISTS OR hidden != true)`, `(quantity > 0 OR hasVariants = true)`];

  if (shopId) {
    filters.push(`shopId = ${shopId}`);
  }

  if (categoryId) {
    filters.push(`categories = ${categoryId}`);
  }

  if (position) {
    const shops = await shopsService.getShopOpeningTimesByLocation({ ...position });
    const openShops = shops.filter(shop => isShopOpen(shop.openingTimes));
    const openShopsIds = openShops.map(shop => shop.id);

    filters.push(`shopId IN [${openShopsIds.join(', ')}]`);
  }

  const results = await index.search(query, {
    filter: filters.join(' AND '),
    sort: ['title:asc'],
    page,
    hitsPerPage,
  });

  return results;
};

export const isProductShopOwner = async ({ productId, shopId }) => {
  const product = await getProductById({ productId });

  if (product.shopId !== shopId) {
    throw new Error('Product not found for this shop');
  }

  return product;
};

export const formatItems = async ({ items }) => {
  const formatedItems = await Promise.all(
    items.map(async item => {
      const { variantId, productId, ...rest } = item;

      const product = await getProductById({ productId });
      const variant = product.Variants.find(variant => variant.id === variantId);

      const formatedItem = {
        ...product,
        productId,
        variantId,
        quantity: item.quantity,
        total: item.price * item.quantity,
        variant,
      } as any;

      delete formatedItem.Variants;
      delete formatedItem.id;

      return formatedItem;
    })
  );

  return formatedItems;
};

export const hideProducts = async ({ productIds, shopId }: { productIds: string[]; shopId: string }) => {
  return await productRepository.hideProducts({ productIds, shopId });
};

export const unhideProducts = async ({ productIds, shopId }: { productIds: string[]; shopId: string }) => {
  return await productRepository.unhideProducts({ productIds, shopId });
};

export const deleteProducts = async ({ productIds, shopId }: { productIds: string[]; shopId: string }) => {
  return await productRepository.deleteProducts({ productIds, shopId });
};

export const productIsAvailable = async ({ productId }) => {
  const product = await getProductById({ productId });

  if (product.quantity <= 0) {
    throw new Error('Product not available');
  }

  if (product.hidden || product.archived) {
    throw new Error('Product not available');
  }

  return product;
};

export const allItemsAreAvailable = async ({ items }: { items: Item[] }) => {
  for (const item of items) {
    await productIsAvailable({ productId: item.productId });
  }
  return true;
};

export const decreaseProductStock = async ({ productId, quantity }) => {
  await productRepository.decreaseProductStock({ productId, quantity });
};
