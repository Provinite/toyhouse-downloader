"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCharacterList = void 0;
const logging_1 = require("../logging");
const toyhouse_1 = require("../toyhouse");
const db_1 = require("../util/db");
/**
 * Generate a character list. Expects browser to be on
 * the toyhouse homepage and logged in.
 * @param page
 */
async function processCharacterList(page) {
    // onward to the character list
    const profileLink = await page.evaluate(toyhouse_1.homePage.getNavLinkUrl, "Profile");
    await page.goto(`${profileLink}/characters/folder:all?page=1`, {
        waitUntil: "networkidle2",
    });
    const pageCount = await page.evaluate(toyhouse_1.allCharacterList.getPageCount);
    logging_1.logger.info(`Processing ${pageCount} pages`);
    const characters = [];
    for (let currentPage = 1; currentPage <= pageCount; currentPage++) {
        if (currentPage > 1) {
            await page.goto(`${profileLink}/characters/folder:all?page=${currentPage}`, {
                waitUntil: "networkidle2",
            });
        }
        const charactersOnPage = await page.evaluate(toyhouse_1.allCharacterList.getCharactersFromPage);
        logging_1.logger.info(`Found ${charactersOnPage.length} characters on page ${currentPage}/${pageCount}`);
        charactersOnPage.forEach((c) => {
            const id = (0, toyhouse_1.extractCharacterIdFromUrl)(c.url);
            if (!id) {
                throw new Error(`Error determining character id from url ${c.url} (character: ${c.name})`);
            }
            characters.push({ ...c, id });
        });
    }
    await db_1.characterList.set(characters);
    return characters;
}
exports.processCharacterList = processCharacterList;
