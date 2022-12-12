"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const fs_1 = require("fs");
const jsonc_1 = require("jsonc");
const path_1 = require("path");
let config = null;
async function getConfig() {
    if (config) {
        return { ...config };
    }
    else {
        const configData = await fs_1.promises.readFile((0, path_1.resolve)((0, path_1.join)(".", "config.jsonc")), "utf8");
        config = jsonc_1.jsonc.parse(configData, {
            stripComments: true,
        });
        return getConfig();
    }
}
exports.getConfig = getConfig;
