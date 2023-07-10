"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("src/utils/logger"));
exports.default = (function (req, res, next) {
    var remoteIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    logger_1.default.info("".concat(req.get("origin"), " ").concat(req.method, " ").concat(req.originalUrl, " from ").concat(remoteIp));
    next();
});
