"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefinedParams = exports.extractCount = void 0;
var extractCount = function (results) { return results.reduce(function (acc, _a) {
    var count = _a.count, column = __rest(_a, ["count"]);
    acc.count = count;
    acc.results.push(column);
    return acc;
}, { results: [], count: 0 }); };
exports.extractCount = extractCount;
var removeUndefinedParams = function (params) {
    return Object.entries(params).reduce(function (acc, _a) {
        var key = _a[0], value = _a[1];
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
};
exports.removeUndefinedParams = removeUndefinedParams;
