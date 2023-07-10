import http from 'http';

import express from 'express';
import useragent from 'express-useragent';
import cors from 'cors';

import config from 'src/config';
import api from 'src/api';
import morganMiddleware from 'src/middlewares/morgan';

import socketIo from 'src/socket';
import path from 'path';

export default async () => {
  const app = express();

  const httpServer = http.createServer(app);
  const socketServer = socketIo(httpServer);

  const whitelist = config.CLIENT_URL_CORS.split(' ');

  app.use(morganMiddleware);

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1 || config.CLIENT_URL_CORS === '*') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '15mb' }));
  app.use(useragent.express());

  app.use('/public', express.static(path.join(__dirname, '..', 'public')));

  app.use('/', api);
  app.set('views', path.join(__dirname, '..', '/views'));
  app.set('view engine', 'pug');

  return {
    app,
    httpServer,
    socketServer,
  };
};
