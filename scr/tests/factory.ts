/* eslint-disable @typescript-eslint/no-empty-function */
import 'regenerator-runtime/runtime';
import supertest from 'supertest';
import axios from 'axios';

import config from 'src/config';
import loaders from 'src/loaders';
import ioc from 'src/utils/iocContainer';

let server;

export const getTestServer = () => {
  return server;
};

export const generateToken = async user => {
  let data = JSON.stringify({
    returnSecureToken: true,
    email: user.email,
    password: user.password,
  });

  let request = {
    method: 'post',
    url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + config.GOOGLE_MAP_API_KEY,
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  } as any;

  const response = await axios.request(request);
  return response.data.idToken;
};

export const getTestServerAuth = async user => {
  const accessToken = await generateToken(user);
  return {
    get: (...props) => server.get(...props).set('Authorization', ['Bearer ' + accessToken]),
    post: (...props) => server.post(...props).set('Authorization', ['Bearer ' + accessToken]),
    put: (...props) => server.put(...props).set('Authorization', ['Bearer ' + accessToken]),
    delete: (...props) => server.delete(...props).set('Authorization', ['Bearer ' + accessToken]),
    update: (...props) => server.update(...props).set('Authorization', ['Bearer ' + accessToken]),
  };
};

export const init = async () => {
  process.env.NODE_ENV = 'test';
  ioc.init();
  await loaders();

  const app = ioc.get('express');
  server = supertest(app);
};
