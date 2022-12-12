"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkdir = void 0;
const fs_1 = require("fs");
async function mkdir(path) {
    try {
        await fs_1.promises.mkdir(path, { recursive: true });
    }
    catch (err) {
        if (err && err.code === "EEXIST")
            return;
        throw err;
    }
}
exports.mkdir = mkdir;
