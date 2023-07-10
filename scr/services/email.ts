import fs from "fs";
import { promisify } from "util";

import { compile, registerPartial } from "handlebars";
import mjml2html from "mjml";


import logger from "src/utils/logger";
import ioc from "src/utils/iocContainer";
import config from "src/config";

import * as userService from "./user";

const readFile = promisify(fs.readFile);

/*const partials = {
  userFooter:"src/assets/mailTemplates/mjml/fr/components/user/footer.mjml",
  userHead:"src/assets/mailTemplates/mjml/fr/components/user/head.mjml",
  userHeader:"src/assets/mailTemplates/mjml/fr/components/user/header.mjml",
};

if (!config.IS_TEST) {
  Object.entries(partials).forEach(([key, value]) => {
    const partial = compile(fs.readFileSync(value, "utf-8"));
    registerPartial(key, partial);
  });
}*/

export const sendMjmlMail = async({ to, variables, subject, fileName, locale }) => {
  const pathFile = "src/assets/mailTemplates/mjml/" + locale + "/" + fileName;
  const validationEmail = await readFile(pathFile, "utf8");


  const template = compile(validationEmail);

  const mjml = template({
    ...variables,
    application_url: config.FRONTEND_URL + "/fr/app/",
    frontend_url: config.FRONTEND_URL,
    footer: {
      ...variables.footer,
      application_url: config.FRONTEND_URL + "/fr/app/",
      frontend_url: config.FRONTEND_URL,
      cgu_url: config.FRONTEND_URL + "/fr/cg/u",
    },
  });
  const html = mjml2html(mjml).html;
  try {
    const data = {
      from: "Livyou <no-reply@mailgun.livyou.com>",
      to: config.IS_PROD ? to : config.DEVEMAIL,
      subject,
      html: html,
    };

    const mailgun = ioc.get("mailgun");
    mailgun.messages().send(data, (error, body) => {
      if (error) {
        logger.error("error when send test email with mailgun. ", error);
      }
      logger.info("email sent", body);
    });
  } catch {
  }
};

export const welcome = async({ user }) => {
  const validationEmail = await readFile("src/assets/mailTemplates/welcome.html", "utf8");

  const template = compile(validationEmail);
  const context = {
    full_name: user.firstName,
  };

  const html = template(context);

  const data = {
    from: "Livyou <no-reply@mailgun.livyou.com>",
    to: config.IS_PROD ? user.email : config.DEVEMAIL,
    subject: "Bienvenue !",
    html: html,
  };

  const mailgun = ioc.get("mailgun");
  mailgun.messages().send(data, (error, body) => {
    if (error) {
      logger.error("error when send test email with mailgun. ", error);
    }
    logger.info("email sent", body);
  });
};

export const sendMessage = async({ userId, object, message }) => {
  const user = await userService.getUserById({ userId });

  try {
    const data = {
      from: "Livyou <no-reply@mailgun.livyou.com>",
      to: config.IS_PROD ? user.email : config.DEVEMAIL,
      subject: object,
      html: message,
    };

    const mailgun = ioc.get("mailgun");
    mailgun.messages().send(data, (error, body) => {
      if (error) {
        logger.error("error when send test email with mailgun. ", error);
      }
      logger.info("email sent", body);
    });
  } catch {
  }
};
