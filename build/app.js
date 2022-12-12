"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("./browser");
const characterList_1 = require("./steps/characterList");
const logging_1 = require("./logging");
const characterCrawl_1 = require("./steps/characterCrawl");
const toyhouse_puppeteer_1 = require("./toyhouse.puppeteer");
const galleryCrawl_1 = require("./steps/galleryCrawl");
const db_1 = require("./util/db");
const imageCrawl_1 = require("./steps/imageCrawl");
const mkdir_1 = require("./util/mkdir");
const path_1 = require("path");
async function main() {
    let browser;
    try {
        logging_1.logger.info("[Startup]");
        await (0, mkdir_1.mkdir)((0, path_1.resolve)((0, path_1.join)(".", "characters")));
        logging_1.logger.info(`
  ====================================================================
  | This application will attempt to archive many details from all   |
  | of your toyhouse characters. This includes names, images, image  |
  | credits, fields, profile template, and a profile screenshot.     |
  |                                                                  |
  | Stages:                                                          |
  |  - [Startup]: Initial startup                                    |
  |  - [Login]: Load toyhouse homepage and login                     |
  |  - [Character List]: Download a list of all of your characters   |
  |  - [Character Crawl]: Download character details and image links |
  |  - [Gallery Crawl]: Download all gallery image metadata          |
  |  - [Image Crawl]: Download all images                            |
  |  - [Shutdown]: Final cleanup                                     |
  ====================================================================`);
        browser = await (0, browser_1.startup)();
        logging_1.logger.info("[Login]");
        logging_1.logger.info("Started chrome headless browser");
        await (0, toyhouse_puppeteer_1.loginToToyhouse)(browser.page);
        const cookies = await browser.page.cookies();
        logging_1.logger.info(`Caching ${cookies.length} cookies`);
        await db_1.browserCookies.set(cookies);
        logging_1.logger.info("[Character List]");
        let characters = await db_1.characterList.get();
        if (!characters) {
            logging_1.logger.info(`No character cache found, generating character list`);
            characters = await (0, characterList_1.processCharacterList)(browser.page);
        }
        else {
            logging_1.logger.info(`Loaded ${characters.length} chracters from cache`);
        }
        if (!characters || !characters.length) {
            logging_1.logger.error(`Error fetching characters, or no characters found.`);
        }
        logging_1.logger.info("[Character Crawl]");
        browser.setLoadImages(true);
        await (0, characterCrawl_1.processCharacterCrawl)(browser, characters);
        browser.setLoadImages(false);
        logging_1.logger.info("[Gallery Crawl]");
        await (0, galleryCrawl_1.processGalleryCrawl)(browser, characters);
        logging_1.logger.info("[Image Crawl]");
        await (0, imageCrawl_1.imageCrawl)(browser, characters);
        logging_1.logger.info("[Shutdown]");
        await (0, browser_1.shutdown)(browser);
    }
    catch (err) {
        logging_1.logger.error(`Fatal error during downloading process`);
        logging_1.logger.error(err);
        logging_1.logger.error(err?.stack);
        if (browser) {
            await (0, browser_1.shutdown)(browser);
        }
    }
}
main();
