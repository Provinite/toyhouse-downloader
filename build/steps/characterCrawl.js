"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCharacterCrawl = void 0;
const browser_1 = require("../browser");
const logging_1 = require("../logging");
const toyhouse_1 = require("../toyhouse");
const progressIndicator_1 = require("../util/progressIndicator");
const db_1 = require("../util/db");
async function processCharacterCrawl({ page }, characters) {
    for (let characterIndex = 0; characterIndex < characters.length; characterIndex++) {
        const { url, id, name } = characters[characterIndex];
        if (db_1.characterDetail.exists(id)) {
            logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} Character metadata for ${name} (${id}) already cached. Continuing`);
            continue;
        }
        logging_1.logger.info(`${(0, progressIndicator_1.progressIndicator)(characterIndex, characters.length)} Crawling character`);
        const nav = page.goto(url, { waitUntil: "networkidle2" });
        await nav;
        const [characterName, profileContents, fields, folderUrl] = await Promise.all([
            page.evaluate(toyhouse_1.characterPage.getName),
            page.evaluate(toyhouse_1.characterPage.getProfileContents),
            page.evaluate(toyhouse_1.characterPage.getFields),
            page.evaluate(toyhouse_1.characterPage.getFolderUrl),
        ]);
        if (!characterName) {
            throw new Error(`Unable to get character name on ${page.url()}`);
        }
        logging_1.logger.info(`Loaded profile for ${characterName}`);
        const character = {
            id,
            url,
            name: characterName,
            folderUrl,
            fields,
            profileContent: profileContents ?? null,
        };
        await Promise.all([
            (0, browser_1.screenshot)(page, {
                path: `./characters/${id}-profile.jpg`,
            }),
            db_1.characterDetail.set(id, character),
        ]);
        logging_1.logger.info(`Saved character metadata for ${character.name} (${character.id}) to ${db_1.characterDetail.fileName(id)} ${character.fields.length} field(s), ${character.profileContent ? "with" : "no"} profile`);
    }
}
exports.processCharacterCrawl = processCharacterCrawl;
