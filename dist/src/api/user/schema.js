"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileSchema = void 0;
var express_validator_1 = require("express-validator");
exports.profileSchema = [
    (0, express_validator_1.body)("payload.email").optional().isEmail().trim().escape(),
    (0, express_validator_1.body)("payload.password").optional().isString(),
    (0, express_validator_1.body)("payload.oldPassword").optional().isString(),
    (0, express_validator_1.body)("payload.lastName").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.firstName").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.phone").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.locale").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.isNewsletterAccepted").optional().isBoolean(),
    (0, express_validator_1.body)("payload.placeId").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.iban").optional().isString().trim().escape(),
    (0, express_validator_1.body)("payload.avatar").optional().isString(),
    (0, express_validator_1.body)("payload.cover").optional().isString(),
];
