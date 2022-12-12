"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserCookies = exports.characterDetail = exports.characterList = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
exports.characterList = createDb(() => (0, path_1.resolve)((0, path_1.join)(".", "characters", "characters.json")));
exports.characterDetail = createDb((id) => (0, path_1.resolve)((0, path_1.join)(".", "characters", `${id}.json`)));
exports.browserCookies = createDb(() => (0, path_1.resolve)((0, path_1.join)(".", "cookies.json")));
function createGetter(fileName) {
    return async (...args) => {
        try {
            return JSON.parse(await fs_1.promises.readFile(fileName(...args), "utf8"));
        }
        catch (err) {
            return null;
        }
    };
}
function createSetter(fileName) {
    return (...args) => {
        const fileNameArgs = args.slice(0, -1);
        const value = args[args.length - 1];
        return fs_1.promises.writeFile(fileName(...fileNameArgs), JSON.stringify(value, null, 2), "utf8");
    };
}
function createExists(fileName) {
    return (...args) => (0, fs_1.existsSync)(fileName(...args));
}
function createDb(fileName) {
    return {
        get: createGetter(fileName),
        set: createSetter(fileName),
        exists: createExists(fileName),
        fileName,
    };
}
