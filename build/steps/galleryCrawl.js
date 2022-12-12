"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGalleryCrawl = void 0;
const logging_1 = require("../logging");
const toyhouse_1 = require("../toyhouse");
const progressIndicator_1 = require("../util/progressIndicator");
const db_1 = require("../util/db");
async function processGalleryCrawl({ page }, characters) {
    for (let characterIndex = 0; characterIndex < characters.length; characterIndex++) {
        const { url, id, name } = characters[characterIndex];
        const cachedCharacter = await db_1.characterDetail.get(id);
        if (!cachedCharacter) {
            throw new Error(`Error reading character (${id}) from cache to add gallery`);
        }
        if (cachedCharacter.gallery) {
            logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} Gallery already cached for character ${name} (${id}). Continuing`);
            continue;
        }
        logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} Crawling gallery info`);
        await page.goto(`${url}/gallery`, {
            waitUntil: "networkidle2",
        });
        // PERF: save json & navigate in parallel
        const images = await page.evaluate(toyhouse_1.gallery.getImages);
        cachedCharacter.gallery = { images };
        db_1.characterDetail.set(id, cachedCharacter);
        logging_1.logger.info(`Saved metadata for ${images.length}/${images.length} images in gallery to ${db_1.characterDetail.fileName(id)}`);
    }
}
exports.processGalleryCrawl = processGalleryCrawl;
