import logger from 'src/utils/logger';
import ioc from 'src/utils/iocContainer';

import firebaseLoader from './firebase';
import expressLoader from './express';
import mailgunLoader from './mailgun';
import swaggerLoader from './swagger';
import wikiLoader from './wiki';
import expressErrorHandlersLoader from './expressErrorHandlers';

export default async () => {
  const { firestore, firestoreAuth, repositories, firebaseBucket, firebaseMessaging, db } = await firebaseLoader();
  ioc.inject('firestore', firestore);
  ioc.inject('firestoreAuth', firestoreAuth);
  ioc.inject('db', db);
  logger.info('✅  DB loaded, connected and injected!');

  Object.entries(repositories).forEach(([key, repository]) => {
    ioc.inject(key, repository);
    logger.info(`  ✔️  repository ${key} loaded and injected!`);
  });

  ioc.inject('firebaseBucket', firebaseBucket);
  logger.info('✅  Firebase Storage Bucket loaded and injected!');

  ioc.inject('firebaseMessaging', firebaseMessaging);
  logger.info('✅  Firebase Messaging loaded and injected!');

  const { app, httpServer, socketServer } = await expressLoader();
  ioc.inject('express', app);
  logger.info('✅  Express loaded and injected!');

  ioc.inject('httpServer', httpServer);
  logger.info('✅  httpServer loaded and injected!');

  ioc.inject('socketServer', socketServer);
  logger.info('✅  socketServer loaded and injected!');

  const mailgun = await mailgunLoader();
  ioc.inject('mailgun', mailgun);
  logger.info('✅  mailgun, loaded and injected!');

  await swaggerLoader();
  logger.info('✅  swagger loaded');

  await wikiLoader();
  logger.info('✅  wiki loaded');

  expressErrorHandlersLoader();
  logger.info('✅  Express error handlers loaded!');
};
