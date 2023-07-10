import { Request, Response, NextFunction } from 'express';
import * as userServices from 'src/services/user';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUser = await userServices.getUserByUid(req.token.uid);

    req.currentUser = currentUser;
  } catch (error) {
    next(error);
  }
  next();
};
