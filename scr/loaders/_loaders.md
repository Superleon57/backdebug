# Loaders

Each *loader* load an app dependency and inject in *ioc* (see [dependency injection](wiki/utils/_iocContainer.md)).

Loaders list
- cron : dispatch jobs every x minutes. used *node-schedule* package
- express : load express and all middlewares
- expressErrorHandlers : lack of express, we need to handle errors and be sure to *use* this middleware at last
- swagger : generate api documentation from **/swagger.js files at [/docs](/docs)
- typeorm : orm to create database connection and load *entities*
- wiki : this wiki serve as static files