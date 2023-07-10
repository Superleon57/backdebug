import ioc from 'src/utils/iocContainer';
import { Product, Variant } from 'src/entities/product';
import { Collections } from 'src/enums/Collections.enum';
import { firestore } from 'firebase-admin';

const getFirestore = () => ioc.get('firestore') as FirebaseFirestore.Firestore;
export const getProductsCollection = () => getFirestore().collection(Collections.Products) as FirebaseFirestore.CollectionReference<Product>;
const getVariantsCollection = () => getFirestore().collection(Collections.Variants);

interface NewProductData {
  title: string;
  description?: string;
  price: number;
  manufacturer: string;
  categories: string[];
  ecoFriendly?: string[];
  imagesURL: string[];
  gender: string;
  material?: string;
  supplierReference?: string;
  storeReference?: string;
  Variants?: Variant[];
}

export const createProduct = async (shopId: string, product: NewProductData) => {
  const productDoc = getProductsCollection().doc();
  const newProduct = {
    id: productDoc.id,
    shopId,
    ...product,
    price: product.price,
  };
  delete newProduct.Variants;
  await productDoc.set(newProduct);
  return newProduct;
};

export const createVariants = async (productId: string, variants: Variant[]) => {
  const variantsRef = getVariantsCollection();
  const batch = getFirestore().batch();
  variants.forEach(variant => {
    const variantRef = variantsRef.doc(productId + '_' + variant.color.name + '_' + variant.size.name);
    batch.set(variantRef, {
      ...variant,
      id: variantRef.id,
      productId,
    });
  });
  await batch.commit();
  return variants;
};

interface UpdatedProductData {
  title?: string;
  description?: string;
  price?: number;
  manufacturer?: string;
  categories?: string[];
  ecoFriendly?: string[];
  imagesURL?: string[];
  material?: string;
  supplierReference?: string;
  storeReference?: string;
  gender?: string;
  Variants?: Variant[];
}

export const updateProduct = async (oldProduct: Product, newData: UpdatedProductData) => {
  const productDoc = getProductsCollection().doc(oldProduct.id);
  const updatedProduct = {
    ...oldProduct,
    ...newData,
  };

  delete updatedProduct.Variants;

  await productDoc.set(updatedProduct, { merge: true });
  return updatedProduct;
};

export const findOneProductById = async (productId: string) => {
  const productDoc = await getProductsCollection().doc(productId).get();
  if (!productDoc.exists) {
    return null;
  }
  const product = productDoc.data() as Product;
  const variants = await getVariantsCollection().where('productId', '==', productId).get();

  product.Variants = variants.docs.map(doc => doc.data() as Variant);
  return product;
};

export const findProductsByShopId = async (shopId: string) => {
  const products = await getProductsCollection().where('shopId', '==', shopId).get();
  return products.docs.map(doc => doc.data());
};

export const findProductsByIds = async (productIds: string[]) => {
  const products = await getProductsCollection().where('id', 'in', productIds).get();
  return products.docs.map(doc => doc.data());
};

export const getProductsByCategoryId = async ({ categoryId }) => {
  const products = await getProductsCollection().where('categories', 'array-contains', categoryId).get();
  return products.docs.map(doc => doc.data());
};

export const hideProducts = async ({ productIds, shopId }: { productIds: string[]; shopId: string }) => {
  const products = await getProductsCollection().where('id', 'in', productIds).get();
  const batch = getFirestore().batch();
  products.docs.forEach(doc => {
    batch.update(doc.ref, { hidden: true });
  });
  await batch.commit();
  return products.docs.map(doc => doc.data());
};

export const unhideProducts = async ({ productIds, shopId }: { productIds: string[]; shopId: string }) => {
  const products = await getProductsCollection().where('id', 'in', productIds).get();
  const batch = getFirestore().batch();
  products.docs.forEach(doc => {
    batch.update(doc.ref, { hidden: false });
  });
  await batch.commit();
  return products.docs.map(doc => doc.data());
};

export const deleteProducts = async ({ productIds, shopId }: { productIds: string[]; shopId: string }) => {
  const products = await getProductsCollection().where('id', 'in', productIds).get();
  const batch = getFirestore().batch();
  products.docs.forEach(doc => {
    batch.update(doc.ref, { archived: true });
  });
  await batch.commit();
  return products.docs.map(doc => doc.data());
};

export const decreaseProductStock = async ({ productId, variantId, quantity }: { productId: string; variantId?: string; quantity: number }) => {
  const product = findOneProductById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const productRef = getProductsCollection().doc(productId);

  if (variantId) {
    const variant = product.Variants.find(v => v.id === variantId);

    if (!variant) {
      throw new Error('Variant not found');
    }

    const variantRef = getVariantsCollection().doc(variantId);

    return await variantRef.update({ quantity: firestore.FieldValue.increment(-quantity) });
  }

  return await productRef.update({
    quantity: firestore.FieldValue.increment(-quantity),
  });
};
