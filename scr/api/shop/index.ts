import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as shopServices from 'src/services/shop';
import * as authServices from 'src/services/auth';
import * as userServices from 'src/services/user';
import * as shopAdminServices from 'src/services/shopAdmin';
import { aroundSchema, shopInfoSchema, shopOpeningTimeSchema, searchSchema, registerSchema } from './schema';

const router = Router();

/* 
  TODO:
  - Set shop open or closed programmatically
*/
router.get('/list/', validator, async (req, res, next) => {
  try {
    const serviceResponse = await shopServices.getAllEnabled();

    return res.json({ shops: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/around', aroundSchema, validator, async (req, res, next) => {
  try {
    const { latitude, longitude, distance, hitsPerPage, page } = req.body.payload;
    const serviceResponse = await shopServices.searchShopsByLocation({ latitude, longitude, distance, hitsPerPage, page });

    return res.json({ ...serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/openingTime', shopOpeningTimeSchema, validator, async (req, res, next) => {
  try {
    const shopId = req.headers.shop;
    const serviceResponse = await shopServices.getOpeningTime({ shopId });

    return res.json({ openingTime: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/search', searchSchema, validator, async (req: Express.Request, res: Express.Response, next) => {
  try {
    const { query, position, hitsPerPage, page } = req.body.payload;
    const serviceResponse = await shopServices.search({ query, position, hitsPerPage, page });

    return res.json({ shops: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/register', registerSchema, validator, async (req, res, next) => {
  try {
    const { shopName, firstName, lastName, email, password } = req.body.payload;
    const newUserAuth = await authServices.createAuth({ email, password, firstName, lastName });

    const newUser = await userServices.createShopAccount({ uid: newUserAuth.uid, firstName, lastName, email });

    const shop = {
      name: shopName,
      owner: newUserAuth.uid,
    };

    const newShop = await shopServices.createShop({ shop });

    await shopAdminServices.createShopAdmin({ userId: newUserAuth.uid, shopId: newShop.id });

    return res.json({ shops: newShop }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:shopId', shopInfoSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const shopInfo = await shopServices.getShopPublicInfo({ shopId });

    return res.json({ shop: shopInfo }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
