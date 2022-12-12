"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageCrawl = void 0;
const db_1 = require("../util/db");
const fs_1 = require("fs");
const logging_1 = require("../logging");
const progressIndicator_1 = require("../util/progressIndicator");
const mkdir_1 = require("../util/mkdir");
const path_1 = require("path");
async function imageCrawl({ page }, characters) {
    for (let characterIndex = 0; characterIndex < characters.length; characterIndex++) {
        const { id, name } = characters[characterIndex];
        const character = await db_1.characterDetail.get(id);
        logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} Processing character gallery images for ${name} (${id})`);
        if (!character || !character.gallery) {
            throw new Error(`Character ${name} (${id}) gallery metadata not found during image crawl`);
        }
        if (!character.gallery.images.length) {
            logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} No images found for character ${name} (${id}). Continuing`);
            continue;
        }
        await (0, mkdir_1.mkdir)((0, path_1.resolve)((0, path_1.join)(".", "characters", "galleries", id)));
        for (let imageIndex = 0; imageIndex < character.gallery.images.length; imageIndex++) {
            const image = character.gallery.images[imageIndex];
            const fileName = getFileName(image.url);
            if (!isValidFileName(fileName)) {
                throw new Error(`Invalid file name: ${fileName} in gallery`);
            }
            const fullFileName = `./characters/galleries/${id}/${fileName}`;
            if ((0, fs_1.existsSync)(fullFileName)) {
                logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} image ${(0, progressIndicator_1.progressIndicator)(imageIndex, character.gallery.images.length)} image ${fileName} already downloaded. Continuing`);
                continue;
            }
            const response = await page.goto(image.url, {
                waitUntil: "networkidle0",
            });
            await fs_1.promises.writeFile(fullFileName, await response.buffer());
            logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} image ${(0, progressIndicator_1.progressIndicator)(imageIndex, character.gallery.images.length)} Saved ${fileName} to ${fullFileName}`);
        }
    }
}
exports.imageCrawl = imageCrawl;
function getFileName(url) {
    return url.substring(url.lastIndexOf("/") + 1).split("?")[0];
}
function isValidFileName(str) {
    return /[a-zA-Z0-9_.-]/.test(str);
}
