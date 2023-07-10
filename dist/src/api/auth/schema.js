"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSignupSchema = exports.signinSchema = void 0;
var express_validator_1 = require("express-validator");
exports.signinSchema = [
    (0, express_validator_1.body)("payload.email").isEmail().trim().escape(),
    (0, express_validator_1.body)("payload.password").isString(),
];
exports.userSignupSchema = [
    (0, express_validator_1.body)("payload.email").isEmail().trim().escape(),
    (0, express_validator_1.body)("payload.password").optional().isString(),
    (0, express_validator_1.body)("payload.lastName").isString().trim().escape(),
    (0, express_validator_1.body)("payload.firstName").isString().trim().escape(),
    (0, express_validator_1.body)("payload.locale").isString().trim().escape(),
    (0, express_validator_1.body)("payload.phone").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.address").optional().isString().trim().escape(),
];
