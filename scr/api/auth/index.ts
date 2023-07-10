import { Router } from 'express';
import validator from 'src/middlewares/validator';
import * as userServices from 'src/services/user';
import { handleLoginResponse } from 'src/utils/api';
import { signinSchema, userSignupSchema, userDeleteSchema } from './schema';
import { Roles } from 'src/enums/rbac.enum';

const router = Router();

//todo: delete?
router.get('/init', async (req, res, next) => {
  try {
    // await authServices.init();

    return res.json({ payload: { status: 'ok' } }).status(200);
  } catch (error) {
    return next(error);
  }
});

//todo: maybe delete this before prod
router.post('/signin', signinSchema, validator, async (req, res, next) => {
  try {
    const serviceResponse = await userServices.getUserByCredentials({
      ...req.body.payload,
    });
    return handleLoginResponse({ serviceResponse, res });
  } catch (error) {
    return next(error);
  }
});

//todo: delete this before prod
//to create a user, user user/new
//because this schema isn't correct
router.post('/user-signup', userSignupSchema, validator, async (req, res, next) => {
  try {
    const serviceResponse = await userServices.createUser_InAuth(req.body.payload);

    // await emailService.sendMjmlMail({
    //   to: req.body.payload.email,
    //   variables: {
    //     user_name: req.body.payload.firstName,
    //   },
    //   subject: "Bienvenue",
    //   fileName: "userSignup.mjml",
    //   locale: req.body.payload.locale,
    // });

    return res.json({ payload: { email: serviceResponse.user.email, id: serviceResponse.user.userId } }).status(200);
  } catch (error) {
    return next(error);
  }
});

export default router;
