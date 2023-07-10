import * as variantRepository from 'src/repositories/variant';
import { getShop } from './shop';

export const removeVariant = async ({ productId, variantId }) => {
  await variantRepository.removeVariant(productId, variantId);
};