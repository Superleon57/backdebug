import { Router } from 'express';

import validator from 'src/middlewares/validator';
import * as companyServices from 'src/services/company';

import { companySchema } from './schema';

const router = Router();

router.post('/', companySchema, validator, async (req, res, next) => {
  try {
    const serviceResponse = await companyServices.createCompany({ company: req.body.payload });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', validator, async (req, res, next) => {
  try {
    const serviceResponse = await companyServices.getCompany({ idCompany: req.params.id });

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
