"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.welcome = exports.sendMjmlMail = void 0;
var fs_1 = __importDefault(require("fs"));
var util_1 = require("util");
var handlebars_1 = require("handlebars");
var mjml_1 = __importDefault(require("mjml"));
var logger_1 = __importDefault(require("src/utils/logger"));
var iocContainer_1 = __importDefault(require("src/utils/iocContainer"));
var config_1 = __importDefault(require("src/config"));
var userService = __importStar(require("./user"));
var readFile = (0, util_1.promisify)(fs_1.default.readFile);
var sendMjmlMail = function (_a) {
    var to = _a.to, variables = _a.variables, subject = _a.subject, fileName = _a.fileName, locale = _a.locale;
    return __awaiter(void 0, void 0, void 0, function () {
        var pathFile, validationEmail, template, mjml, html, data, mailgun;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pathFile = "src/assets/mailTemplates/mjml/" + locale + "/" + fileName;
                    return [4, readFile(pathFile, "utf8")];
                case 1:
                    validationEmail = _b.sent();
                    template = (0, handlebars_1.compile)(validationEmail);
                    mjml = template(__assign(__assign({}, variables), { application_url: config_1.default.FRONTEND_URL + "/fr/app/", frontend_url: config_1.default.FRONTEND_URL, footer: __assign(__assign({}, variables.footer), { application_url: config_1.default.FRONTEND_URL + "/fr/app/", frontend_url: config_1.default.FRONTEND_URL, cgu_url: config_1.default.FRONTEND_URL + "/fr/cg/u" }) }));
                    html = (0, mjml_1.default)(mjml).html;
                    try {
                        data = {
                            from: "Livyou <no-reply@mailgun.livyou.com>",
                            to: config_1.default.IS_PROD ? to : config_1.default.DEVEMAIL,
                            subject: subject,
                            html: html,
                        };
                        mailgun = iocContainer_1.default.get("mailgun");
                        mailgun.messages().send(data, function (error, body) {
                            if (error) {
                                logger_1.default.error("error when send test email with mailgun. ", error);
                            }
                            logger_1.default.info("email sent", body);
                        });
                    }
                    catch (_c) {
                    }
                    return [2];
            }
        });
    });
};
exports.sendMjmlMail = sendMjmlMail;
var welcome = function (_a) {
    var user = _a.user;
    return __awaiter(void 0, void 0, void 0, function () {
        var validationEmail, template, context, html, data, mailgun;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, readFile("src/assets/mailTemplates/welcome.html", "utf8")];
                case 1:
                    validationEmail = _b.sent();
                    template = (0, handlebars_1.compile)(validationEmail);
                    context = {
                        full_name: user.firstName,
                    };
                    html = template(context);
                    data = {
                        from: "Livyou <no-reply@mailgun.livyou.com>",
                        to: config_1.default.IS_PROD ? user.email : config_1.default.DEVEMAIL,
                        subject: "Bienvenue !",
                        html: html,
                    };
                    mailgun = iocContainer_1.default.get("mailgun");
                    mailgun.messages().send(data, function (error, body) {
                        if (error) {
                            logger_1.default.error("error when send test email with mailgun. ", error);
                        }
                        logger_1.default.info("email sent", body);
                    });
                    return [2];
            }
        });
    });
};
exports.welcome = welcome;
var sendMessage = function (_a) {
    var idUser = _a.idUser, object = _a.object, message = _a.message;
    return __awaiter(void 0, void 0, void 0, function () {
        var user, data, mailgun;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, userService.getUserById({ idUser: idUser })];
                case 1:
                    user = _b.sent();
                    try {
                        data = {
                            from: "Livyou <no-reply@mailgun.livyou.com>",
                            to: config_1.default.IS_PROD ? user.email : config_1.default.DEVEMAIL,
                            subject: object,
                            html: message,
                        };
                        mailgun = iocContainer_1.default.get("mailgun");
                        mailgun.messages().send(data, function (error, body) {
                            if (error) {
                                logger_1.default.error("error when send test email with mailgun. ", error);
                            }
                            logger_1.default.info("email sent", body);
                        });
                    }
                    catch (_c) {
                    }
                    return [2];
            }
        });
    });
};
exports.sendMessage = sendMessage;
