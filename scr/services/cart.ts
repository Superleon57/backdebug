import * as cartRepository from 'src/repositories/cart';
import * as productService from 'src/services/product';
import * as shopService from 'src/services/shop';
import * as userService from 'src/services/user';
import { getDistance } from 'src/services/maps';
import { Item } from 'src/entities/item';
import config from 'src/config';
import { Product } from 'src/entities/product';
import { Cart } from 'src/entities/cart';
import { getShopFees } from './fees';
import { CalculatedFees, CustomerFee } from 'src/entities/Fees';

const createCart = async ({ userId }) => {
  return await cartRepository.createCart({ userId });
};

export const addToCart = async ({ cart, product, variantId }: { cart: Cart; product: Product; variantId?: string }) => {
  try {
    const updatedCart = await cartRepository.addProductToCart({ cart, product, variantId });

    return {
      cart: updatedCart,
    };
  } catch (err) {
    throw err;
  }
};

export const getCart = async ({ userId }): Promise<Cart> => {
  let cart = await cartRepository.findOneByUserId({ userId });

  if (!cart.id) {
    return await createCart({ userId });
  }

  return cart;
};

export const getCartItems = async ({ cartId }) => {
  const items = await cartRepository.getCartItems({ cartId });
  return items;
};

export const getFormatedCartItems = async ({ cart }) => {
  const cartItems = await getCartItems({ cartId: cart.id });

  const items = await productService.formatItems({ items: cartItems });

  return items;
};

export const deleteItemFromCart = async ({ productId, variantId, quantity, userId }) => {
  try {
    if (quantity < 1) {
      throw new Error(`Invalid quantity`);
    }

    const cart = await getCart({ userId });

    const item = await cartRepository.getItemFromCart({ cart, productId, variantId });

    if (quantity > item.quantity) {
      throw new Error(`Invalid quantity`);
    }

    if (item.quantity == 1 || quantity == item.quantity) {
      return await cartRepository.deleteItem({ cart, item });
    }

    return await cartRepository.decreaseItemQuantity({ cart, item, quantity });
  } catch (err) {
    throw err;
  }
};

export const isFromDifferentShop = async ({ cart, product }) => {
  if (!cart.shopId) {
    return false;
  }

  const isFromDifferentShop = cart.shopId !== product.shopId;

  return isFromDifferentShop;
};

export const clearCart = async ({ userId }) => {
  try {
    const cart = await getCart({ userId });
    const updatedCart = await cartRepository.clearCart({ cart });

    return {
      cart: updatedCart,
    };
  } catch (err) {
    throw err;
  }
};

export const calculateTotal = cartItems => {
  let total = 0;
  cartItems.forEach(item => {
    total += item.total;
  });
  return total;
};

export const calculateShippingFees = async ({ cartItems, distanceInMetter }: { cartItems: Item[]; distanceInMetter: number }) => {
  const total = calculateTotal(cartItems);
  const distanceInKm = distanceInMetter / 1000;

  const shopId = cartItems[0].shopId;
  const fees = await calculateFees(total, distanceInKm, shopId);

  return fees;
};

export const canBeDelivered = async ({ cart }: { cart: Cart }) => {
  if (!cart.distance) {
    return false;
  }

  const shopFees = await getShopFees({ shopId: cart.shopId });

  const { customerFees } = shopFees;
  const distanceInKm = cart.distance.distanceValue / 1000;

  const deliveryLevel = getDeliveryLevel(customerFees, distanceInKm, cart.subTotal);

  if (deliveryLevel === undefined) {
    return false;
  }

  return true;
};

const calculateTotalDeliveryCost = (distanceInKm: number, shopFees: any): number => {
  const { deliveryFeePerKm, baseDeliveryFee } = shopFees;
  const distanceCost = Math.round(distanceInKm * deliveryFeePerKm);
  const totalDeliveryCost = baseDeliveryFee + distanceCost;

  return totalDeliveryCost;
};

const findNearestCustomerFee = (customerFees: CustomerFee[], orderAmount: number) => {
  const nearest = customerFees.find(customerFee => orderAmount >= customerFee.minimumCartPrice && orderAmount <= customerFee.maximumCartPrice);

  return nearest;
};

export const getDeliveryLevel = (customerFees: any[], distanceInKm: number, orderAmount: number): any => {
  const customerFee = findNearestCustomerFee(customerFees, orderAmount);

  return customerFee?.levels.find(level => distanceInKm >= level.from && distanceInKm <= level.to);
};

const getPlatformFee = (orderAmount: number, onlivyouPercentage: number): number => {
  const amountHt = orderAmount / (1 + 20 / 100);

  return Math.round((amountHt * onlivyouPercentage) / 100);
};

const calculateFees = async (orderAmount: number, distanceInKm: number, shopId: string): Promise<CalculatedFees> => {
  const shopFees = await getShopFees({ shopId });
  const { customerFees } = shopFees;

  const deliveryLevel = getDeliveryLevel(customerFees, distanceInKm, orderAmount);

  const maxDeliveryCost = deliveryLevel.delivery;
  const totalDeliveryCost = calculateTotalDeliveryCost(distanceInKm, shopFees);
  let clientDeliveryFee = totalDeliveryCost;

  if (clientDeliveryFee > maxDeliveryCost) {
    clientDeliveryFee = maxDeliveryCost;
  }

  const remainingDeliveryFee = totalDeliveryCost - clientDeliveryFee;

  const totalPrice = orderAmount + clientDeliveryFee + deliveryLevel.service;

  const platformFee = getPlatformFee(orderAmount, shopFees.platformFee);
  const onlivyouRevenue = platformFee - remainingDeliveryFee + deliveryLevel.service;
  const merchantRevenue = orderAmount - onlivyouRevenue;

  return {
    totalDeliveryCost,
    deliveryFee: clientDeliveryFee,
    serviceFee: deliveryLevel.service,
    subTotal: orderAmount,
    totalPrice: totalPrice,
    appFee: remainingDeliveryFee,
    onlivyou: onlivyouRevenue,
    merchant: merchantRevenue,
  };
};

export const setDistance = async ({ userId }: { userId: string }) => {
  const cart = await getCart({ userId });

  if (!cart) {
    throw new Error(`Cart not found`);
  }

  const shop = await shopService.getShop({ shopId: cart.shopId });
  const userLocation = await userService.getUserLastLocation({ userId });

  const shopLocation = {
    latitude: shop.address.latitude,
    longitude: shop.address.longitude,
  };

  const distance = await getDistance(shopLocation, userLocation.position);

  await cartRepository.setDistance({ cart, distance });

  return distance;
};

export const handleReturnInsurance = async ({ cart, status }) => {
  if (status) {
    return await cartRepository.addReturnInsurance({ cart, price: config.RETURN_INSURANCE_PRICE });
  }
  await cartRepository.removeReturnInsurance({ cart });
};

export const getCartWithFees = async (cart: Cart) => {
  if (!cart.distance) {
    return getZeroFees();
  }

  const items = await getFormatedCartItems({ cart });
  const deliveryPossible = await canBeDelivered({ cart });

  const fees = deliveryPossible ? await calculateShippingFees({ cartItems: items, distanceInMetter: cart?.distance?.distanceValue }) : getZeroFees();
  const insurance = getInsurance(cart);

  const data = {
    cart: { items },
    fees: getFees({ ...fees, insurance }),
    distance: cart.distance,
    deliveryPossible,
  };

  return data;
};
const getZeroFees = () => ({
  deliveryFee: 0,
  serviceFee: 0,
  insurance: 0,
  totalPrice: 0,
  subTotal: 0,
});

const getInsurance = (cart: Cart) => (cart.returnInsurance ? cart.returnInsurancePrice : 0);

const getFees = ({ deliveryFee, serviceFee, insurance, totalPrice, subTotal }) => ({
  deliveryFee,
  serviceFee,
  insurance,
  totalPrice: totalPrice + insurance,
  subTotal,
});
