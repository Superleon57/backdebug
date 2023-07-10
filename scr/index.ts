import config from "src/config";
import loaders from "src/loaders";
import logger from "src/utils/logger";
import ioc from "src/utils/iocContainer";
import 'reflect-metadata';

const startServer = async() => {
  process.env.TZ = "UTC";

  logger.info("");
  logger.info(`⚙️  ENV: ${config.NODE_ENV}`);
  logger.info(`⚙️  LOG_LEVEL: ${config.LOG_LEVEL}`);
  logger.info(`⚙️  TZ: ${process.env.TZ}`);
  logger.info("");


  await loaders();

  const httpServer = ioc.get("httpServer");

  httpServer.listen(config.NODE_PORT, () => {
    logger.info("");
    logger.info("####################################");
    logger.info(`🛡️  Server listening on port: ${config.NODE_PORT} 🛡️`);
    logger.info("####################################");
    logger.info("");
  });
};

startServer();
