import config from 'src/config';
import * as cheerio from 'cheerio';
import { createHmac } from 'crypto';

import * as userServices from 'src/services/user';

export const getPaymentServer = async () => {
  const servers = [config.PAYMENT_SERVEUR_RECETTE, config.PAYMENT_SERVEUR_PROD1, config.PAYMENT_SERVEUR_PROD2];

  for (const server of servers) {
    const serverIsOK = await isPaymentServerOK(server);
    if (serverIsOK) {
      return `https://${server}/php/`;
    }
  }

  return '';
};

export const isPaymentServerOK = async server => {
  try {
    const response = await fetch(`https://${server}/load.html`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const serverStatus = $('#server_status').text();

    if (serverStatus === 'OK') {
      return true;
    }
  } catch (error) {
    console.error(`Une erreur s'est produite pour le serveur ${server}:`, error);
  }

  return false;
};

export const formatShoppingCart = ({ cart }) => {
  return (
    '<?xml version="1.0" encoding="utf-8"?><shoppingcart><total><totalQuantity>' + cart.numberOfItems + '</totalQuantity></total></shoppingcart>'
  );
};

export const formatBillingAddress = async ({ user }) => {
  const address = await userServices.getUserLastLocation({ userId: user.id });
  const countryCode = 250;

  return (
    '<?xml version="1.0" encoding="utf-8"?><Billing><Address><FirstName>' +
    user.FirstName +
    '</FirstName>' +
    '<LastName>' +
    user.lastName +
    '</LastName><Address1>' +
    address.addr1 +
    '</Address1>' +
    '<Address2>' +
    address.addr2 +
    '</Address2><ZipCode>' +
    address.cp +
    '</ZipCode>' +
    '<City>' +
    address.ville +
    '</City><CountryCode>' +
    countryCode +
    '</CountryCode>' +
    '</Address></Billing>'
  );
};

export const getHmac = msgData => {
  const { HMACKEY } = config;
  const hmac = createHmac('sha512', Buffer.from(HMACKEY, 'hex'));

  const msg = Object.keys(msgData)
    .map(key => `${key}=${msgData[key]}`)
    .join('&');
  hmac.update(msg);
  const digest = hmac.digest('hex');

  return digest.toUpperCase();
};

export const getMsgData = async ({ cart, fees, user, orderNumber }) => {
  const dateTime = new Date().toISOString();

  const msgData = {
    PBX_SITE: config.PBX_SITE,
    PBX_RANG: config.PBX_RANG,
    PBX_IDENTIFIANT: config.PBX_IDENTIFIANT,
    PBX_TOTAL: fees.totalPrice,
    PBX_DEVISE: 978,
    PBX_CMD: orderNumber,
    PBX_PORTEUR: user.email,
    PBX_REPONDRE_A: config.BASE_URL + config.PAYMENT_CALLBACK_URL + '?uid=' + user.uid,
    PBX_RETOUR: 'amount:M;ref:R;auto:A;error:E;sign:K;Abo:U;',
    PBX_EFFECTUE: config.BASE_URL + config.PAYMENT_SUCCESS_URL,
    PBX_ANNULE: config.BASE_URL + config.PAYMENT_CANCEL_URL,
    PBX_REFUSE: config.BASE_URL + config.PAYMENT_ERROR_URL,
    PBX_HASH: 'SHA512',
    PBX_TIME: dateTime,
    PBX_SHOPPINGCART: formatShoppingCart({ cart }),
    PBX_BILLING: await formatBillingAddress({ user }),
    PBX_REFABONNE: 'test',
    PBX_SOURCE: 'RWD',
  };

  return msgData;
};
