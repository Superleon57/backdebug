"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLoginResponse = exports.getQueryParams = void 0;
var security_1 = require("src/utils/security");
var config_1 = __importDefault(require("src/config"));
var getQueryParams = function (params) {
    var paramsQuery = new URLSearchParams();
    return Object.entries(params).reduce(function (acc, _a) {
        var key = _a[0], value = _a[1];
        if (typeof value !== 'undefined' && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(function (param) {
                    acc.append(key, param);
                });
            }
            else {
                acc.append(key, value);
            }
        }
        return acc;
    }, paramsQuery);
};
exports.getQueryParams = getQueryParams;
var handleLoginResponse = function (_a) {
    var serviceResponse = _a.serviceResponse, res = _a.res;
    var payload = {
        email: serviceResponse.email,
        firstName: serviceResponse.firstName,
        lastName: serviceResponse.lastName,
        idUser: serviceResponse.idUser,
        idCompany: serviceResponse.idCompany,
        accessToken: serviceResponse.accessToken,
        roles: serviceResponse.roles,
        department: serviceResponse.department,
        isCguAccepted: serviceResponse.isCguAccepted,
        refreshToken: "",
        isImpersonate: serviceResponse.isImpersonate,
    };
    if (config_1.default.IS_DEV) {
        payload.refreshToken = serviceResponse.refreshToken;
    }
    else {
        (0, security_1.setRefreshCookie)(res, serviceResponse.refreshToken);
    }
    return res.send({
        payload: payload,
    }).status(200);
};
exports.handleLoginResponse = handleLoginResponse;
