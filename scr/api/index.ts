import { Router } from 'express';

import isAuth from 'src/middlewares/isAuth';
import getUser from 'src/middlewares/getUser';
import isShopAdmin from 'src/middlewares/isShopAdmin';

import auth from './auth';
import shop from './shop';
import category from './category';
import product from './product';
import payment from './payment';
import prestashop from './prestashop';

import protectedUpload from './upload';
import protectedCart from './cart';
import protectedOrder from './order';
import protectedUser from './user';

import adminShop from './admin/shop';
import adminCategory from './admin/category';
import adminStatistics from './admin/statistics';
import adminProduct from './admin/product';
import adminOrder from './admin/order';
import adminVariant from './admin/variant';
import adminDeliveryMan from './admin/deliveryMan';
import adminUpload from './admin/upload';

import deliveryMan from './deliveryman';

import supervisor from './supervisor';

import ping from './chore/ping';
import health from './chore/health';
import rbac from 'src/middlewares/rbac';

const router = Router();

router.use('/api/v1/ping', ping);
router.use('/api/v1/health', health);
router.use('/api/v1/auth', auth);
router.use('/api/v1/prestashop', prestashop);
router.use('/api/v1/shop', shop);
router.use('/api/v1/category', category);
router.use('/api/v1/product', product);
router.use('/api/v1/payment', payment);

const protectedRouter = () => {
  const router = Router();
  router.use('/user', protectedUser);
  router.use('/cart', protectedCart);
  router.use('/order', protectedOrder);
  router.use('/upload', protectedUpload);
  return router;
};

const adminRouter = () => {
  const router = Router();
  router.use('/shop', adminShop);
  router.use('/category', adminCategory);
  router.use('/statistics', adminStatistics);
  router.use('/product', adminProduct);
  router.use('/order', adminOrder);
  router.use('/variant', adminVariant);
  router.use('/deliveryMan', adminDeliveryMan);
  router.use('/upload', adminUpload);

  return router;
};

const deliveryManRouter = () => {
  const router = Router();
  router.use('/', deliveryMan);
  return router;
};

router.use('/api/v1/protected', isAuth, protectedRouter());
router.use('/api/v1/protected/admin', isAuth, isShopAdmin, adminRouter());
router.use('/api/v1/protected/deliveryman', isAuth, getUser, deliveryManRouter());
router.use('/api/v1/protected/supervisor', isAuth, getUser, rbac, supervisor);

export default router;
