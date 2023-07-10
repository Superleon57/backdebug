import { Roles } from 'src/enums/rbac.enum';
import { forbiddenActionException } from 'src/utils/errors';
import logger from 'src/utils/logger';

export default (req, res, next) => {
  let foundRule = false;
  accessControl.forEach(access => {
    if (req.originalUrl.startsWith(access.path)) {
      if (!access.roles?.find(role => req.currentUser.role === role)) {
        logger.info(`(${req.requestId}) - rbac restrict ${req.currentUser.roles} / ${req.currentUser.email} access on ${req.originalUrl}`);
        foundRule = true;

        throw forbiddenActionException;
      }
    }
  });

  if (!foundRule) {
    return next();
  }
};

const accessControl = [
  { path: '/api/v1/protected/admin', roles: [Roles.ADMIN] },
  { path: '/api/v1/protected/user', roles: [Roles.USER] },
  { path: '/api/v1/protected/deliveryman', roles: [Roles.LIVREUR] },
  { path: '/api/v1/protected/supervisor', roles: [Roles.SUPERVISOR] },
];
