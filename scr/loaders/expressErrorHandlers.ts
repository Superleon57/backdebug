import config from 'src/config';
import ioc from 'src/utils/iocContainer';
import logger from 'src/utils/logger';

const formatValidationError = error => {
  return {
    property: error.property,
    constraints: error.constraints,
  };
};

const formatValidationChildren = error => {
  if (error.children.length > 0) {
    return error.children.map(child => {
      return formatValidationError(child);
    });
  }
  return formatValidationError(error);
};

const ValidationError = errors => {
  const errorMessages = errors.map(error => {
    if (error.children.length > 0) {
      console.log(error.children[0]);
      return error.children.map(child => {
        return formatValidationChildren(child);
      });
    }
    return formatValidationError(error);
  });

  return errorMessages;
};

export default async () => {
  process.on('unhandledRejection', error => {
    logger.info('######## unhandledRejection ########');
    throw error;
  });

  process.on('uncaughtException', error => {
    logger.info('######## uncaughtException ########');
    console.log(error)

    process.exit(1);
  });
  const app = ioc.get('express');

  app.use((req, res, next) => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(404).json();
  });

  app.use((err, req, res, next) => {
    if (err) {
      const errStatus = err.status || 500;

      if (Array.isArray(err)) {
        const errorMessages = ValidationError(err);
        logger.info(`(${req.requestId}) - ERROR: ${errStatus} message: ${err ?? 'Internal Error'}`);

        return res.status(errStatus).json({ message: errorMessages });
      }

      if (err.code) {
        logger.info(`(${req.requestId}) - ERROR: ${errStatus} - code: ${err.code} - message: ${err?.message ?? 'Internal Error'}`);
      } else {
        logger.error(`(${req.requestId}) - ERROR: ${errStatus} - message: ${err?.message ?? 'Internal Error'}`);
        if (err.stack) {
          logger.error(`(${req.requestId}) - ERROR STACK: ${err.stack}`);
        }
      }
      return res
        .status(errStatus)
        .json({ code: err?.code, message: err?.message ?? 'Internal Error', stack: (!config.IS_PROD && err?.stack) ?? 'no stack' });
    } else {
      next();
    }
  });
};
