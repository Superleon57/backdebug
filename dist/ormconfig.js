"use strict";
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
module.exports = {
    host: process.env.DB_PG_HOST,
    type: "postgres",
    port: process.env.DB_PG_PORT,
    username: process.env.DB_PG_USER,
    password: process.env.DB_PG_PASSWORD,
    database: process.env.DB_PG_DATABASE,
    entities: ["./src/entities/*.ts"],
    migrations: ["./migrations/*{.ts,.js}"],
    cli: {
        migrationsDir: "migrations",
    },
    synchronize: true,
};
