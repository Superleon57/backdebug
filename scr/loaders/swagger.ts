import { promisify } from "util";
import fs from "fs";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import ioc from "src/utils/iocContainer";
import config from "src/config";


const readFile = promisify(fs.readFile);

export default async() => {
  const app = ioc.get("express");

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Livyou API",
        version: "0.1.0",
        description:
          "Complete API for Livyou.",
        license: {
          name: "MIT",
          url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
          name: "Livyou",
          url: "https://livyou.com",
          email: "contact@livyou.com",
        },
      },
      servers: [
        {
          url: config.BASE_URL,
        },
      ],
    },
    apis: ["src/api/**/swagger.yaml"],
  };

  const customCss = await readFile("src/assets/swaggerTheme.css");

  const cssOptions = {
    customCss,
  };

  const specs = swaggerJsdoc(options);
  app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, cssOptions),
  );
};
