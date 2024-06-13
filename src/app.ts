import { PreparedBrowser, shutdown, startup } from "./browser";
import { processCharacterList } from "./steps/characterList";

import { logger } from "./logging";
import { processCharacterCrawl } from "./steps/characterCrawl";
import { loginToToyhouse } from "./toyhouse.puppeteer";
import { processGalleryCrawl } from "./steps/galleryCrawl";
import { browserCookies, characterList } from "./util/db";
import { imageCrawl } from "./steps/imageCrawl";
import { mkdir } from "./util/mkdir";
import { resolve, join } from "path";
import { processFolderList } from "./steps/folderList";
import { homePage } from "./toyhouse";
import { processReadFolder } from "./steps/readFolder";
/**
 * Toyhouse downloader entry point.
 */
async function main() {
  let browser: PreparedBrowser | undefined;
  try {
    logger.info("[Startup]");
    await mkdir(resolve(join(".", "characters")));
    logger.info(`
  ====================================================================
  | This application will attempt to bump all of the characters in   |
  | the specified folder.                                            |
  | credits, fields, profile template, and a profile screenshot.     |
  |                                                                  |
  | Stages:                                                          |
  |  - [Startup]: Initial startup                                    |
  |  - [Login]: Load toyhouse homepage and login                     |
  |  - [Read Folder]: Load characters list from the folder           |
  |  - [Bump]: Bump each character                                   |
  |  - [Shutdown]: Final cleanup                                     |
  ====================================================================`);
    browser = await startup();
    await browser.setLoadImages(true);
    logger.info("[Login]");
    await loginToToyhouse(browser.page);

    const cookies = await browser.page.cookies();
    logger.info(`Caching ${cookies.length} cookies`);
    await browserCookies.set(cookies);

    logger.info("[Read Folder]");
    await processReadFolder(browser);

    // logger.info("[Character List]");
    // let characters = await characterList.get();
    // if (!characters) {
    //   logger.info(`No character cache found, generating character list`);
    //   characters = await processCharacterList(browser.page);
    // } else {
    //   logger.info(`Loaded ${characters.length} chracters from cache`);
    // }
    // if (!characters || !characters.length) {
    //   logger.error(`Error fetching characters, or no characters found.`);
    // }

    // logger.info("[Character Crawl]");
    // browser.setLoadImages(true);
    // await processCharacterCrawl(browser, characters);
    // browser.setLoadImages(false);

    // logger.info("[Gallery Crawl]");
    // await processGalleryCrawl(browser, characters);

    // logger.info("[Image Crawl]");
    // await imageCrawl(browser, characters);

    // logger.info("[Shutdown]");
    // await shutdown(browser);
  } catch (err: any) {
    logger.error(`Fatal error during downloading process`);
    logger.error(err);
    logger.error(err?.stack);
  } finally {
    if (browser) {
      await shutdown(browser);
    }
  }
}

main();
