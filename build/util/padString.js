"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padRight = exports.padLeft = void 0;
function padLeft(str, len, pad = " ") {
    return `${getPadding(str, len, pad)}${str}`;
}
exports.padLeft = padLeft;
function padRight(str, len, pad = " ") {
    return `${str}${getPadding(str, len, pad)}`;
}
exports.padRight = padRight;
function getPadding(str, len, pad) {
    return pad.repeat(Math.max(0, len - str.length));
}
