import { config } from 'dotenv';

config();

const NODE_ENV = process.env.NODE_ENV || 'development';

export default {
  NODE_ENV,
  IS_DEV: NODE_ENV === 'development',
  IS_DEV_OR_IS_TEST: NODE_ENV === 'development' || NODE_ENV === 'test',
  IS_TEST: NODE_ENV === 'test',
  IS_PROD: NODE_ENV === 'production',
  IS_SEED: Boolean(process.env.IS_SEED) || false,
  NODE_PORT: parseInt(process.env.PORT || '3000', 10),
  CLIENT_URL_CORS: process.env.CLIENT_URL_CORS || '',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  BASE_URL: process.env.BASE_URL || '',

  DEVEMAIL: process.env.DEVEMAIL,

  GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,

  MEILISEARCH_HOST: process.env.MEILISEARCH_HOST || '',
  MEILISEARCH_MASTER_KEY: process.env.MEILISEARCH_MASTER_KEY || '',
  MEILISEARCH_SEARCH_KEY: process.env.MEILISEARCH_SEARCH_KEY || '',

  PAYMENT_SERVEUR_RECETTE: process.env.PAYMENT_SERVEUR_RECETTE || '',
  PAYMENT_SERVEUR_PROD1: process.env.PAYMENT_SERVEUR_PROD1 || '',
  PAYMENT_SERVEUR_PROD2: process.env.PAYMENT_SERVEUR_PROD2 || '',
  HMACKEY: process.env.HMACKEY || '',

  PBX_SITE: process.env.PBX_SITE || '',
  PBX_RANG: process.env.PBX_RANG || '',
  PBX_IDENTIFIANT: process.env.PBX_IDENTIFIANT || '',

  PAYMENT_CALLBACK_URL: process.env.PAYMENT_CALLBACK_URL || '',
  PAYMENT_SUCCESS_URL: process.env.PAYMENT_SUCCESS_URL || '',
  PAYMENT_CANCEL_URL: process.env.PAYMENT_CANCEL_URL || '',
  PAYMENT_ERROR_URL: process.env.PAYMENT_ERROR_URL || '',

  DELIVERY_RADIUS: parseInt(process.env.DELIVERY_RADIUS || '5000', 10),
  DELIVERYMAN_RADIUS: parseInt(process.env.DELIVERYMAN_RADIUS || '2000', 10),
};
