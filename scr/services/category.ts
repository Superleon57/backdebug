import * as MeiliSearch from 'src/services/meilisearch';
import * as categoryRepository from 'src/repositories/category';

export const createCategory = async ({ category }) => {
  try {
    const newCategory = await categoryRepository.createCategory(category);

    return {
      newCategory,
    };
  } catch (err) {
    throw err;
  }
};

export const getCategory = async ({ id }) => {
  return await categoryRepository.findOneById({ id });
};

export const getAll = async () => {
  return await categoryRepository.findAll();
};

export const createShopCategory = async ({ shopId, category }) => {
  const newCategory = await categoryRepository.createShopCategory({ shopId, category });

  return {
    newCategory,
  };
};

export const updateCategory = async ({ categoryId, category }) => {
  const updatedCategory = await categoryRepository.updateCategory({ categoryId, category });

  return {
    updatedCategory,
  };
};

export const getShopCategories = async ({ shopId }) => {
  return await categoryRepository.getShopCategories({ shopId });
};

export const getCategoryFromShop = async ({ shopId, categoryId }) => {
  return await categoryRepository.getCategoryFromShop({ shopId, categoryId });
};

export const getByName = async ({ name }) => {
  return await categoryRepository.getByName({ name });
};

export const getByNameFromShop = async ({ shopId, name }) => {
  return await categoryRepository.getByNameFromShop({ shopId, name });
};

export const getUsableCategories = async ({ shopId }) => {
  const [globalCategories, shopCategories] = await Promise.all([getAll(), getShopCategories({ shopId })]);

  const categories = [...shopCategories, ...globalCategories];

  return categories;
};

export const getUsedCategoriesByShopId = async ({ shopId }) => {
  const categoriesFacets = await MeiliSearch.productsIndex().search('', {
    filter: `shopId = ${shopId}`,
    limit: 0,
    facets: ['categories'],
  });

  const categoriesIds = Object.keys(categoriesFacets?.facetDistribution?.categories ?? {});

  const categories = await getUsableCategories({ shopId });

  const usedCategories = categories.filter(({ id }) => categoriesIds.includes(id));

  return usedCategories;
};
