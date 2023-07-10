"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var morgan_1 = __importDefault(require("morgan"));
var logger_1 = require("src/utils/logger");
exports.default = (0, morgan_1.default)(function (tokens, req, res) {
    var remoteIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    return "".concat(req.get("origin"), " ").concat(req.method, " ").concat(req.originalUrl, " from ").concat(remoteIp, ", status: ").concat(tokens.status(req, res), ", content-length: ").concat(tokens.res(req, res, "content-length"), ", ").concat(tokens["response-time"](req, res), " ms");
}, { stream: logger_1.stream });
