import logger from "src/utils/logger";

export default (req, res, next) => {
  const remoteIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  logger.info(`${req.get("origin")} ${req.method} ${req.originalUrl} from ${remoteIp}`);
  next();
};
