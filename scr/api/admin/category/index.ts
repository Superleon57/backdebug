import { Router } from 'express';

import validator from 'src/middlewares/validator';
import { fileExistsInUpload } from 'src/middlewares/upload';

import * as categoryServices from 'src/services/category';

import { categorySchema } from './schema';
import { uploadImage, upload } from 'src/services/upload';
import compressImage from 'src/middlewares/compressImage';
import { categoryAlreadyExist, categoryNotFound, forbiddenActionException } from 'src/utils/errors';

const router = Router();

router.post('/', upload.single('image'), fileExistsInUpload, compressImage, categorySchema, validator, async (req, res, next) => {
  try {
    const { shopId, file } = req;
    const { name } = req.body;

    const url = await uploadImage({ fileName: file.originalname, contents: file.buffer, uploadFolder: 'shops/categories' });

    const cetegoryExists = await categoryServices.getByNameFromShop({ name, shopId });

    if (cetegoryExists) {
      throw categoryAlreadyExist;
    }

    const category = { name, image: url };

    const serviceResponse = await categoryServices.createShopCategory({ shopId, category });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:categoryId', upload.single('image'), compressImage, categorySchema, validator, async (req, res, next) => {
  try {
    const { shopId, file } = req;
    const { name } = req.body;
    const { categoryId } = req.params;

    let url = '';
    if (file) {
      console.log('file');
      url = await uploadImage({ fileName: file.originalname, contents: file.buffer, uploadFolder: 'shops/categories' });
      console.log('url', url);
    }

    const cetegoryExists = await categoryServices.getCategoryFromShop({ categoryId, shopId });

    if (!cetegoryExists) {
      throw categoryNotFound;
    }

    const category = { name } as any;

    if (url) {
      category.image = url;
    }

    const serviceResponse = await categoryServices.updateCategory({ categoryId, category });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:shopId', validator, async (req, res, next) => {
  try {
    const { shopId } = req.params;

    const categories = await categoryServices.getUsableCategories({ shopId });

    return res.json({ payload: { categories } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
