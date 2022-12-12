import { shutdown, startup } from "./browser";
import { processCharacterList } from "./steps/characterList";

import { logger } from "./logging";
import { processCharacterCrawl } from "./steps/characterCrawl";
import { loginToToyhouse } from "./toyhouse.puppeteer";
import { processGalleryCrawl } from "./steps/galleryCrawl";
import { characterList } from "./util/db";
import { imageCrawl } from "./steps/imageCrawl";

async function main() {
  logger.info("[Startup]");
  logger.info(`
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
  const browser = await startup();
  logger.info("[Login]");
  logger.info("Started chrome headless browser");
  await loginToToyhouse(browser.page);

  logger.info("[Character List]");
  let characters = await characterList.get();
  if (!characters) {
    logger.info(`No character cache found, generating character list`);
    characters = await processCharacterList(browser.page);
  } else {
    logger.info(`Loaded ${characters.length} chracters from cache`);
  }
  if (!characters || !characters.length) {
    logger.error(`Error fetching characters, or no characters found.`);
  }

  logger.info("[Character Crawl]");
  browser.setLoadImages(true);
  await processCharacterCrawl(browser, characters);
  browser.setLoadImages(false);

  logger.info("[Gallery Crawl]");
  await processGalleryCrawl(browser, characters);

  logger.info("[Image Crawl]");
  await imageCrawl(browser, characters);

  logger.info("[Shutdown]");
  await shutdown(browser);
}

main();
