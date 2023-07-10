import ioc from 'src/utils/iocContainer';
import { Cart } from 'src/entities/cart';
import { Item } from 'src/entities/item';
import { ISubCollection } from 'fireorm';
import { Product, Variant } from 'src/entities/product';
import { Collections } from 'src/enums/Collections.enum';
import { FieldValue } from 'firebase-admin/firestore';

const getFirestore = () => ioc.get('firestore') as FirebaseFirestore.Firestore;
export const getCartsCollection = () => getFirestore().collection(Collections.Carts);
const getCartItemsCollection = (cartId: string) => getCartsCollection().doc(cartId).collection(Collections.CartItems);

export const findOneById = async ({ idCart }) => {
  const cartCollection = getCartsCollection();
  const cartDoc = cartCollection.doc(idCart);

  const cart = await cartDoc.get();

  return cart.data() as Cart;
};

export const getCartItems = async ({ cartId }) => {
  const cartItemsCollection = getCartItemsCollection(cartId);
  const cartItems = await cartItemsCollection.get();

  return cartItems.docs.map(doc => doc.data()) as Item[];
};

export const getItemFromCart = async ({ cart, productId, variantId = null }) => {
  const itemId = variantId ? `${productId}_${variantId}` : productId;
  const cartItemsCollection = getCartItemsCollection(cart.id);
  const cartItem = await cartItemsCollection.doc(itemId).get();

  return cartItem.data() as Item;
};

export const findOneByUserId = async ({ userId }) => {
  const cartCollection = getCartsCollection();

  const cart = await cartCollection.where('userId', '==', userId).get();

  if (cart.empty) {
    return {} as Cart;
  }

  return cart.docs[0].data() as Cart;
};

export const createCart = async ({ userId }) => {
  const entityManager = ioc.get('cartRepository');
  const cart = new Cart();
  cart.Items = [] as unknown as ISubCollection<Item>;
  cart.userId = userId;
  cart.subTotal = 0;
  cart.numberOfItems = 0;
  cart.returnInsurance = false;
  cart.returnInsurancePrice = 0;

  return await entityManager.create(cart);
};

export const addProductToCart = async ({ cart, product, variantId }: { cart: Cart; product: Product; variantId?: string }) => {
  const itemId = variantId ? `${product.id}_${variantId}` : product.id;
  const cartCollection = getCartsCollection();
  const cartItemsDoc = getCartItemsCollection(cart.id).doc(itemId);

  const item: Item = {
    id: itemId,
    productId: product.id,
    shopId: product.shopId,
    price: product.price,
  };

  if (variantId) {
    item.variantId = variantId;
  }

  return getFirestore().runTransaction(async transaction => {
    const [itemExists] = await Promise.all([transaction.get(cartItemsDoc), transaction.get(cartCollection.doc(cart.id))]);

    const quantity = itemExists.exists ? (itemExists.data() as Item).quantity + 1 : 1;

    const itemToUpdate = { quantity, ...(itemExists.exists ? {} : item) };

    transaction.set(cartItemsDoc, itemToUpdate, { merge: true });

    const updatedCart = {
      subTotal: cart.subTotal + item.price,
      numberOfItems: cart.numberOfItems + 1,
      ...(cart.shopId ? {} : { shopId: product.shopId }),
    };

    transaction.set(cartCollection.doc(cart.id), updatedCart, { merge: true });

    return updatedCart;
  });
};

export const deleteItem = async ({ cart, item }) => {
  const cartCollection = getCartsCollection();
  const cartItemsCollection = getCartItemsCollection(cart.id);

  const itemRef = cartItemsCollection.doc(item.id);
  const cartRef = cartCollection.doc(cart.id);

  const transaction = getFirestore().runTransaction(async t => {
    const itemDoc = await t.get(itemRef);
    const itemData = itemDoc.data() as Item;

    await t.delete(itemRef);

    const updatedCart: any = {
      subTotal: FieldValue.increment(-itemData.price * itemData.quantity),
      numberOfItems: FieldValue.increment(-itemData.quantity),
    };

    if (cart.numberOfItems === 1 || cart.numberOfItems === itemData.quantity) {
      updatedCart.shopId = FieldValue.delete();
      updatedCart.distance = FieldValue.delete();
    }

    t.update(cartRef, updatedCart);
  });

  return transaction;
};

export const decreaseItemQuantity = async ({ cart, item, quantity }) => {
  const cartCollection = getCartsCollection();
  const cartItemsCollection = getCartItemsCollection(cart.id);

  const itemRef = cartItemsCollection.doc(item.id);
  const cartRef = cartCollection.doc(cart.id);

  const transaction = getFirestore().runTransaction(async t => {
    const itemDoc = await t.get(itemRef);
    const itemData = itemDoc.data() as Item;

    await t.update(itemRef, { quantity: FieldValue.increment(-quantity) });

    const updatedCart: any = {
      subTotal: FieldValue.increment(-itemData.price * quantity),
      numberOfItems: FieldValue.increment(-quantity),
    };

    t.update(cartRef, updatedCart);
  });

  return transaction;
};

export const clearCart = async ({ cart }) => {
  const cartRepository = await ioc.get('cartRepository');
  return await cartRepository.delete(cart.id);
};

export const deleteAllItems = async ({ cart }) => {};

export const setDistance = async ({ cart, distance }) => {
  const entityManager = ioc.get('cartRepository');
  cart.distance = distance;
  return await entityManager.update(cart);
};

export const addReturnInsurance = async ({ cart, price }) => {
  const entityManager = ioc.get('cartRepository');
  cart.returnInsurance = true;
  cart.returnInsurancePrice = price;

  return await entityManager.update(cart);
};

export const removeReturnInsurance = async ({ cart }) => {
  const entityManager = ioc.get('cartRepository');
  cart.returnInsurance = false;
  delete cart.returnInsurancePrice;

  return await entityManager.update(cart);
};
