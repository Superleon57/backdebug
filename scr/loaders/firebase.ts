import * as admin from 'firebase-admin';
import * as fireorm from 'fireorm';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

import { Shop } from 'src/entities/shop';
import { user } from 'src/entities/user';
import { Cart } from 'src/entities/cart';
import { Order } from 'src/entities/order';
import { Category } from 'src/entities/category';
import { Product } from 'src/entities/product';
import { OrderItem } from 'src/entities/item';
import { ShopAdmin } from 'src/entities/shopAdmin';

const serviceAccount = require('src/config/firestore.creds.json');

export default async () => {
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    storageBucket: `${serviceAccount.project_id}.appspot.com`,
  });

  const firestore = admin.firestore();
  fireorm.initialize(firestore, {
    validateModels: true,
  });

  const firestoreAuth = getAuth(app);
  const firebaseBucket = getStorage().bucket();
  const firebaseMessaging = admin.messaging();
  const db = admin.database();

  return {
    firestore,
    firestoreAuth,
    firebaseBucket,
    firebaseMessaging,
    db,
    repositories: {
      shopRepository: fireorm.getRepository(Shop),
      userRepository: fireorm.getRepository(user),
      cartRepository: fireorm.getRepository(Cart),
      orderRepository: fireorm.getRepository(Order),
      categoryRepository: fireorm.getRepository(Category),
      productRepository: fireorm.getRepository(Product),
      orderItemRepository: fireorm.getRepository(OrderItem),
      shopAdminRepository: fireorm.getRepository(ShopAdmin),
    },
  };
};
