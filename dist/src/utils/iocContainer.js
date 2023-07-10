"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = __importDefault(require("src/utils/logger"));
var dependencies = {};
var init = function () {
    Object.getOwnPropertyNames(dependencies).forEach(function (prop) {
        delete dependencies[prop];
    });
};
var replace = function (name, dependency) {
    if (!dependencies[name]) {
        logger_1.default.warn("Dependency ".concat(name, " not exists. Abort."));
        throw new Error("Dependency ".concat(name, " not exists. Abort."));
    }
    dependencies[name] = dependency;
};
var inject = function (name, dependency) {
    if (dependencies[name]) {
        logger_1.default.warn("Dependency ".concat(name, " already injected. Abort."));
        throw new Error("Dependency ".concat(name, " already injected. Abort."));
    }
    dependencies[name] = dependency;
};
var get = function (name) {
    if (!dependencies[name]) {
        logger_1.default.warn("Dependency ".concat(name, " not exists. Abort."));
        throw new Error("Dependency ".concat(name, " not exists. Abort."));
    }
    return dependencies[name];
};
exports.default = {
    inject: inject,
    get: get,
    init: init,
    replace: replace,
};
