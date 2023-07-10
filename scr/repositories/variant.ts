import ioc from 'src/utils/iocContainer';
import { Collections } from 'src/enums/Collections.enum';
import { getProductsCollection } from './product';

const getVariantsCollection = (productId: string) => getProductsCollection().doc(productId).collection(Collections.Variants);

export const removeVariant = async (productId: string, variantId: string) => {
  const variant = getVariantsCollection(productId);
  await variant.doc(variantId).delete();
};
