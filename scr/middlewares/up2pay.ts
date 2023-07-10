import crypto from 'crypto';
const fs = require('fs');

const publicKey = fs.readFileSync('src/config/up2pay/pubkey.pem', 'utf8');
const authorizedIps = ['194.2.122.190', '195.25.67.22'];

export const isAuthorizedIp = async (ip: string) => {
  return authorizedIps.includes(ip);
};

export const authorizedServer = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const isAuthorized = await isAuthorizedIp(ip);
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

export const isValidSignature = async (req, res, next) => {
  const query = req.query;

  const data = `amount=${query.amount}&ref=${query.ref}&auto=${query.auto}&error=${query.error}`;
  const decodedData = decodeURIComponent(data);
  const decodedSign = decodeURIComponent(query.sign);

  const verify = crypto.createVerify('RSA-SHA1');
  verify.update(decodedData);

  const result = verify.verify(publicKey, decodedSign, 'base64');

  if (!result) {
    return res.status(401).json({ error: 'invalid signature' });
  }

  next();
};
