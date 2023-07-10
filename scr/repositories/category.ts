import ioc from 'src/utils/iocContainer';
import { Category } from 'src/entities/category';
import { Collections } from 'src/enums/Collections.enum';

const getFirestore = () => ioc.get('firestore') as FirebaseFirestore.Firestore;
export const getCategoriesCollection = () => getFirestore().collection(Collections.Categories);

export const findOneById = async ({ id }) => await ioc.get('categoryRepository').findOne({ id });

export const findOneByCategoryId = async ({ categoryId }) => await ioc.get('categoryRepository').findOne({ categoryId });

export const findAll = async () => {
  const categoriesCollection = getCategoriesCollection();
  const categoriesQuery = await categoriesCollection.where('type', 'in', ['general', 'eco-friendly']).get();

  const categories = categoriesQuery.docs.map(doc => {
    const category = doc.data() as Category;
    category.id = doc.id;
    return category;
  });

  return categories;
};

export const createCategory = async ({ name, image }) => {
  const categoryRepository = ioc.get('categoryRepository');
  const category = new Category();

  category.name = name;
  category.image = image;

  const createdCategory = await categoryRepository.create(category);

  return createdCategory;
};

export const createShopCategory = async ({ shopId, category }) => {
  const categoriesCollection = getCategoriesCollection();
  const categoryDoc = categoriesCollection.doc();

  const newCategory = {
    id: categoryDoc.id,
    shopId,
    type: 'shop',
    ...category,
  };

  await categoryDoc.set(newCategory);

  return newCategory;
};

export const updateCategory = async ({ categoryId, category }) => {
  const categoriesCollection = getCategoriesCollection();
  const categoryDoc = categoriesCollection.doc(categoryId);

  await categoryDoc.update(category, { merge: true });

  return category;
};

export const getShopCategories = async ({ shopId }) => {
  const categoriesCollection = getCategoriesCollection();
  const categoriesQuery = await categoriesCollection.where('type', '==', 'shop').where('shopId', '==', shopId).get();

  const categories = categoriesQuery.docs.map(doc => {
    const category = doc.data() as Category;
    category.id = doc.id;
    return category;
  });

  return categories;
};

export const getByName = async ({ name }) => {
  const categoriesCollection = getCategoriesCollection();
  const categoriesQuery = await categoriesCollection.where('name', '==', name).get();

  const categories = categoriesQuery.docs.map(doc => {
    const category = doc.data() as Category;
    category.id = doc.id;
    return category;
  });

  return categories;
};

export const getByNameFromShop = async ({ shopId, name }) => {
  const categoriesCollection = getCategoriesCollection();
  const categoriesQuery = await categoriesCollection.where('name', '==', name).where('shopId', '==', shopId).limit(1).get();

  const categories = categoriesQuery.docs.map(doc => {
    const category = doc.data() as Category;
    category.id = doc.id;
    return category;
  });

  return categories.length ? categories[0] : null;
};

export const getCategoryFromShop = async ({ shopId, categoryId }) => {
  const categoriesCollection = getCategoriesCollection();
  const categoryDoc = await categoriesCollection.doc(categoryId).get();

  if (!categoryDoc.exists) {
    return null;
  }

  const category = categoryDoc.data() as Category;

  if (category.type === 'general') {
    return category;
  }

  if (category.type === 'shop' && category.shopId === shopId) {
    return category;
  }

  return null;
};
