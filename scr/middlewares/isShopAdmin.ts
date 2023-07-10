import * as shopAdminServices from 'src/services/shopAdmin';
import { forbiddenActionException } from 'src/utils/errors';

export default async (req, payload, done) => {
  try{

    const shopAdmin = await shopAdminServices.findByUserId({ userId: req.token.uid });
  
    if (shopAdmin) {
      req.shopId = shopAdmin.shopId;
      return done(null, payload);
    }
    throw forbiddenActionException;
  }
  catch(err){
    return done(err);
  }


};
