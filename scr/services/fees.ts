import { Fees } from 'src/entities/Fees';
import * as feesRepository from 'src/repositories/fees';

export const getFees = async (): Promise<Fees> => {
  try {
    const fees = await feesRepository.getFees();

    return fees;
  } catch (err) {
    throw err;
  }
};

export const updateFees = async ({ fees }) => {
  try {
    const updatedFees = await feesRepository.update(fees);

    return updatedFees;
  } catch (err) {
    throw err;
  }
};

export const getShopFees = async ({ shopId }): Promise<Fees> => {
  try {
    const fees = await feesRepository.getShopFees({ shopId });

    if (!fees || !fees.useCustomFees) {
      return await getFees();
    }

    return fees;
  } catch (err) {
    throw err;
  }
};

export const updateShopFees = async ({ shopId, fees }) => {
  try {
    const updatedFees = await feesRepository.updateShopFees({ shopId, fees });

    return updatedFees;
  } catch (err) {
    throw err;
  }
};
