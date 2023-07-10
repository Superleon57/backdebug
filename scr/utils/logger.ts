import { createLogger, format, transports } from "winston";

import config from "src/config";

const logger = createLogger({
  level: config.LOG_LEVEL,
  silent: config.IS_TEST || config.IS_SEED,
  format: format.combine(
    format.timestamp({ format: "YY-MM-DD HH:mm:ss ZZ" }),
    format.errors({ stack: true }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new transports.Console(),
  ],
});


export default logger;

export const stream = {
  write: function(message) {
    logger.info(message);
  },
};
