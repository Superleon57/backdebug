"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_validator_1 = require("express-validator");
exports.default = (function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    else {
        req.body = (0, express_validator_1.matchedData)(req, {
            includeOptionals: false,
            onlyValidData: true,
        });
        req.query = (0, express_validator_1.matchedData)(req, {
            includeOptionals: false,
            onlyValidData: true,
        });
        next();
    }
});
