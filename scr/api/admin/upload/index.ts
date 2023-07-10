import { Router } from 'express';
import multer from 'multer';

import * as shopAdminServices from 'src/services/shopAdmin';
import * as shopServices from 'src/services/shop';

import { shopImageSchema } from './schema';
import validator from 'src/middlewares/validator';
import { fileExistsInUpload } from 'src/middlewares/upload';

const router = Router();

const memoStorage = multer.memoryStorage();
const upload = multer({ memoStorage });

import { uploadImage } from 'src/services/upload';

router.post('/add', upload.single('image'), async (req, res, next) => {
  try {
    const { file } = req;

    const url = await uploadImage({ fileName: file.originalname, contents: file.buffer, uploadFolder: 'products' });

    return res.json({ payload: { url } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/image', upload.single('image'), shopImageSchema, validator, async (req, res, next) => {
  try {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { shopId } = req.body;
    const isShopAdmin = await shopAdminServices.isShopAdmin({ userId: req.token.uid, shopId });

    if (!isShopAdmin) {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    const url = await uploadImage({ fileName: file.originalname, contents: file.buffer, uploadFolder: 'shops', newFileName: shopId });

    await shopServices.updateShopImage({ shopId, imageUrl: url });

    return res.json({ payload: { url } }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/logo', upload.single('image'), fileExistsInUpload, async (req, res, next) => {
  try {
    const { shopId, file } = req;

    const isShopAdmin = await shopAdminServices.isShopAdmin({ userId: req.token.uid, shopId });

    if (!isShopAdmin) {
      return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    const url = await uploadImage({ fileName: file.originalname, contents: file.buffer, uploadFolder: 'shops/logos', newFileName: shopId });

    await shopServices.updateShopLogo({ shopId, imageUrl: url });

    return res.json({ payload: { url } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
