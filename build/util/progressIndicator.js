"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressIndicator = void 0;
const padString_1 = require("./padString");
function progressIndicator(index, max) {
    const indexString = (index + 1).toString();
    const displayIndex = (0, padString_1.padLeft)(indexString, max.toString().length, "0");
    return `(${displayIndex}/${max})`;
}
exports.progressIndicator = progressIndicator;
