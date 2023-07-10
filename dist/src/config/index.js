"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var NODE_ENV = process.env.NODE_ENV || "development";
exports.default = {
    NODE_ENV: NODE_ENV,
    IS_DEV: NODE_ENV === "development",
    IS_DEV_OR_IS_TEST: NODE_ENV === "development" || NODE_ENV === "test",
    IS_TEST: NODE_ENV === "test",
    IS_PROD: NODE_ENV === "production",
    IS_SEED: Boolean(process.env.IS_SEED) || false,
    NODE_PORT: parseInt(process.env.NODE_PORT || "3000", 10),
    CLIENT_URL_CORS: process.env.CLIENT_URL_CORS || "",
    FRONTEND_URL: process.env.FRONTEND_URL || "",
    LOG_LEVEL: process.env.LOG_LEVEL || "debug",
    BASE_URL: process.env.BASE_URL || "",
    DB_PG_HOST: process.env.DB_PG_HOST,
    DB_PG_PORT: process.env.DB_PG_PORT,
    DB_PG_USER: process.env.DB_PG_USER,
    DB_PG_PASSWORD: process.env.DB_PG_PASSWORD,
    DB_PG_DATABASE: process.env.DB_PG_DATABASE,
    SEED_PASSWORD: process.env.SEED_PASSWORD,
    SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
    SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
    DEVEMAIL: process.env.DEVEMAIL,
};
