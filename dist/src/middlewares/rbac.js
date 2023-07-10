"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rbac_enum_1 = require("src/enums/rbac.enum");
var errors_1 = require("src/utils/errors");
var logger_1 = __importDefault(require("src/utils/logger"));
exports.default = (function (req, res, next) {
    var foundRule = false;
    accessControl.forEach(function (access) {
        var _a;
        if (req.originalUrl.startsWith(access.path)) {
            if (!((_a = access.roles) === null || _a === void 0 ? void 0 : _a.find(function (role) { return (role === rbac_enum_1.Roles.ADMIN && req.currentUser.isImpersonate) || req.currentUser.roles.includes(role); }))) {
                logger_1.default.info("(".concat(req.requestId, ") - rbac restrict ").concat(req.currentUser.roles, " / ").concat(req.currentUser.email, " access on ").concat(req.originalUrl));
                foundRule = true;
                throw errors_1.forbiddenActionException;
            }
        }
    });
    if (!foundRule) {
        return next();
    }
});
var accessControl = [
    { path: "/api/v1/protected/admin", roles: [rbac_enum_1.Roles.ADMIN] },
    { path: "/api/v1/protected/user", roles: [rbac_enum_1.Roles.USER] },
    { path: "/api/v1/protected/livreur", roles: [rbac_enum_1.Roles.LIVREUR] },
];
