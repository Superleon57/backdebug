import { body, header } from 'express-validator';

export const shopImageSchema = [body('shopId').isString(), body('image')];
