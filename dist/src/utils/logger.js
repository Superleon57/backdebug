"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
var winston_1 = require("winston");
var config_1 = __importDefault(require("src/config"));
var logger = (0, winston_1.createLogger)({
    level: config_1.default.LOG_LEVEL,
    silent: config_1.default.IS_TEST || config_1.default.IS_SEED,
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "YY-MM-DD HH:mm:ss ZZ" }), winston_1.format.errors({ stack: true }), winston_1.format.printf(function (info) { return "".concat(info.timestamp, " ").concat(info.level, ": ").concat(info.message); })),
    transports: [
        new winston_1.transports.Console(),
    ],
});
exports.default = logger;
exports.stream = {
    write: function (message) {
        logger.info(message);
    },
};
