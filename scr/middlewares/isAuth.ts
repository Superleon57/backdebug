import ioc from 'src/utils/iocContainer';

import { getAccessTokenFromHeader } from 'src/utils/security';

export const setTokenFromQuery = (req, res, next) => {
  const idToken = req.query.token;
  req.headers.authorization = `Bearer ${idToken}`;
  next();
};

export default (req, payload, done) => {
  const auth = ioc.get('firestoreAuth');
  const idToken = getAccessTokenFromHeader(req);
  auth
    .verifyIdToken(idToken)
    .then(payload => {
      req.token = payload;
      return done(null, payload);
    })
    .catch(error => {
      done(error);
    });
};
