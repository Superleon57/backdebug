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



export default router;
