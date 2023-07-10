"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_1 = __importDefault(require("./auth"));
var user_1 = __importDefault(require("./user"));
var company_1 = __importDefault(require("./company"));
var prestashop_1 = __importDefault(require("./prestashop"));
var ping_1 = __importDefault(require("./chore/ping"));
var health_1 = __importDefault(require("./chore/health"));
var router = (0, express_1.Router)();
router.use("/api/v1/ping", ping_1.default);
router.use("/api/v1/health", health_1.default);
router.use("/api/v1/auth", auth_1.default);
router.use("/api/v1/prestashop", prestashop_1.default);
router.use("/api/v1/company", company_1.default);
var protectedRouter = function () {
    var router = (0, express_1.Router)();
    router.use("/user", user_1.default);
    return router;
};
exports.default = router;
