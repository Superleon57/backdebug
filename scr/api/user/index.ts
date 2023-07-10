import { Router } from 'express';
import * as userServices from 'src/services/user';
import * as orderServices from 'src/services/order';
import { createUserSchema, updateUserSchema } from './schema';
import validator from 'src/middlewares/validator';

const router = Router();

router.get('/profile', async (req: any, res, next) => {
  try {
    const currentUser = await userServices.getUserByUid(req.token.uid);

    return res.json({ payload: { profile: currentUser } }).status(200);
  } catch (error) {
    return next(error);
  }
});

//l'utilisateur doit déjà existé dans auth avant d'être créée dans la BDD
router.post('/new', createUserSchema, async (req: any, res, next) => {
  try {
    const user = req.body.payload;
    user.uid = req.token.uid;
    const serviceResponse = await userServices.createUser_InBdd(user);

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.post('/update', updateUserSchema, validator, async (req: any, res, next) => {
  try {
    const user = req.body.payload;
    user.uid = req.token.uid;
    const serviceResponse = await userServices.updateUser(user);

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

router.delete('/', async (req: any, res, next) => {
  try {
    const removeOrders = await orderServices.removeUserOrders({ userId: req.token.uid });
    const serviceResponse = await userServices.removeUser(req.token.uid);

    return res.json({ payload: serviceResponse }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
