import morgan from 'morgan';
const chalk = require('chalk');

import { stream } from 'src/utils/logger';

export default morgan(
  function (tokens, req, res) {
    const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return [
      '\n',
      chalk.hex('#b3b428').bold(tokens.method(req, res)),
      chalk.hex('#4badbc').bold(tokens.url(req, res) + ','),
      chalk.hex('#ffb142').bold('Status : ' + tokens.status(req, res)),
      '\n',
      chalk.yellow(tokens['remote-addr'](req, res)),
      chalk.hex('#fffa65').bold('from ' + tokens.referrer(req, res)),
      chalk.hex('#1e90ff')(`content-length: ${tokens.res(req, res, 'content-length')},`),
      chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms'),
    ].join(' ');
  },
  { stream }
);
// ;
