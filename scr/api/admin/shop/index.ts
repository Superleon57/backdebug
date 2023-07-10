import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as shopServices from 'src/services/shop';
import * as shopAdminServices from 'src/services/shopAdmin';
import * as orderServices from 'src/services/order';

import {
  shopSchema,
  shopConfigSchema,
  shopOpeningTimeSchema,
  messagingTokenSchema,
  addAdminSchema,
  shopInformationsSchema,
  shopAddressSchema,
  colorSchema,
  sizeSchema,
} from './schema';
import { getAddressFromPlaceId } from 'src/services/maps';
import { colorAlreadyExist, colorNotFound, sizeAlreadyExist, sizeNotFound } from 'src/utils/errors';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { shopId } = req;
    const shopAdmin = await shopServices.getShop({ shopId });

    return res.json({ payload: { shop: shopAdmin } }).status(200);
  } catch (error) {
    return next(error);
  }
});
router.post('/new', shopSchema, validator, async (req, res, next) => {
  try {
    const serviceResponse = await shopServices.createShop({ shop: { ...req.body.payload, owner: req.token.uid } });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/config', shopConfigSchema, validator, async (req, res, next) => {
  try {
    const serviceResponse = await shopServices.createShopConfig({ ...req.body.payload });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/openingTime', shopOpeningTimeSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { openingTimes } = req.body.payload;

    const serviceResponse = await shopServices.updateOpeningTimes({ shopId, newOpeningTimes: openingTimes });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.patch('/messagingToken', messagingTokenSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { token } = req.body.payload;
    const serviceResponse = await shopServices.updateMessagingToken({ shopId, token });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/addAdmin', addAdminSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { userId } = req.body.payload;

    const serviceResponse = await shopAdminServices.createShopAdmin({ shopId, userId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/customers', async (req, res, next) => {
  const { shopId } = req;

  try {
    const customers = await orderServices.getUsersWhoOrdered({ shopId });

    return res.json({ payload: customers }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.patch('/', shopInformationsSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { name, description, slogan } = req.body.payload;
    const serviceResponse = await shopServices.updateShopInfo({ shopId, name, description, slogan });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.patch('/address', shopAddressSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { placeId } = req.body.payload;

    const address = await getAddressFromPlaceId(placeId);

    const serviceResponse = await shopServices.updateShopAddress({ shopId, address });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/color', colorSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { name, value } = req.body.payload;

    if (await shopAdminServices.getColor({ shopId, name })) {
      throw colorAlreadyExist;
    }

    const serviceResponse = await shopAdminServices.createColor({ shopId, name, value });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/size', sizeSchema, validator, async (req, res, next) => {
  try {
    const { shopId } = req;
    const { name, value } = req.body.payload;

    const size = await shopAdminServices.getSize({ shopId, name });

    console.log('size', size);

    if (size) {
      throw sizeAlreadyExist;
    }

    const serviceResponse = await shopAdminServices.createSize({ shopId, name, value });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/colors', async (req, res, next) => {
  try {
    const { shopId } = req;

    const serviceResponse = await shopAdminServices.getColors({ shopId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/sizes', async (req, res, next) => {
  try {
    const { shopId } = req;

    const serviceResponse = await shopAdminServices.getSizes({ shopId });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.delete('/color/:name', async (req, res, next) => {
  try {
    const { shopId } = req;
    const { name } = req.params;

    const serviceResponse = await shopAdminServices.removeColor({ shopId, name });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.delete('/size/:name', async (req, res, next) => {
  try {
    const { shopId } = req;
    const { name } = req.params;

    const serviceResponse = await shopAdminServices.removeSize({ shopId, name });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
