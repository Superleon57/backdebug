"use strict";
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
var logger_1 = __importDefault(require("src/utils/logger"));
var iocContainer_1 = __importDefault(require("src/utils/iocContainer"));
var firebase_1 = __importDefault(require("./firebase"));
var express_1 = __importDefault(require("./express"));
var mailgun_1 = __importDefault(require("./mailgun"));
var swagger_1 = __importDefault(require("./swagger"));
var wiki_1 = __importDefault(require("./wiki"));
var expressErrorHandlers_1 = __importDefault(require("./expressErrorHandlers"));
exports.default = (function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firestore, firestoreAuth, repositories, _b, app, httpServer, mailgun;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4, (0, firebase_1.default)()];
            case 1:
                _a = _c.sent(), firestore = _a.firestore, firestoreAuth = _a.firestoreAuth, repositories = _a.repositories;
                iocContainer_1.default.inject("firestore", firestore);
                iocContainer_1.default.inject("firestoreAuth", firestoreAuth);
                logger_1.default.info("✅  DB loaded, connected and injected!");
                Object.entries(repositories).forEach(function (_a) {
                    var key = _a[0], repository = _a[1];
                    iocContainer_1.default.inject(key, repository);
                    logger_1.default.info("  \u2714\uFE0F  repository ".concat(key, " loaded and injected!"));
                });
                return [4, (0, express_1.default)()];
            case 2:
                _b = _c.sent(), app = _b.app, httpServer = _b.httpServer;
                iocContainer_1.default.inject("express", app);
                logger_1.default.info("✅  Express loaded and injected!");
                iocContainer_1.default.inject("httpServer", httpServer);
                logger_1.default.info("✅  httpServer loaded and injected!");
                return [4, (0, mailgun_1.default)()];
            case 3:
                mailgun = _c.sent();
                iocContainer_1.default.inject("mailgun", mailgun);
                logger_1.default.info("✅  mailgun, loaded and injected!");
                return [4, (0, swagger_1.default)()];
            case 4:
                _c.sent();
                logger_1.default.info("✅  swagger loaded");
                return [4, (0, wiki_1.default)()];
            case 5:
                _c.sent();
                logger_1.default.info("✅  wiki loaded");
                (0, expressErrorHandlers_1.default)();
                logger_1.default.info("✅  Express error handlers loaded!");
                return [2];
        }
    });
}); });
