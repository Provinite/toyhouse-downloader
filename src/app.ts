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
import { screenshot } from "./browser";
/**
 * Toyhouse downloader entry point.
 */
async function main() {
  let browser: PreparedBrowser | undefined;
  let currentStep: string | undefined;
  const beginStep = (stepName?: string) => {
    if (currentStep) {
      logger.info(`[${currentStep}]: Finished`);
    }
    currentStep = stepName;
    if (currentStep) {
      logger.info(`[${currentStep}]: Start`);
    }
  };
  try {
    beginStep("Startup");
    await mkdir(resolve(join(".", "characters")));
    logger.info(`
  ====================================================================
  | This application will attempt to archive many details from all   |
  | of your toyhouse characters. This includes names, images, image  |
  | credits, fields, profile template, and a profile screenshot.     |
  |                                                                  |
  | Stages:                                                          |
  |  - [Startup]: Initial startup                                    |
  |  - [Login]: Load toyhouse homepage and login                     |
  |  - [Folder List]: Load a list of all folders                     |
  |  - [Character List]: Download a list of all of your characters   |
  |  - [Character Crawl]: Download character details                 |
  |  - [Gallery Crawl]: Download all gallery image metadata          |
  |  - [Image Crawl]: Download all images                            |
  |  - [Shutdown]: Final cleanup                                     |
  ====================================================================`);
    browser = await startup();

    beginStep("Login");
    await loginToToyhouse(browser.page);

    const cookies = await browser.page.cookies();
    logger.info(`Caching ${cookies.length} cookies`);
    await browserCookies.set(cookies);

    beginStep("Folder List");
    await processFolderList(browser);

    beginStep("Character List");
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

    beginStep("Character Crawl");
    browser.setLoadImages(true);
    await processCharacterCrawl(browser, characters);
    browser.setLoadImages(false);

    beginStep("Gallery Crawl");
    await processGalleryCrawl(browser, characters);

    beginStep("Image Crawl");
    await imageCrawl(browser, characters);

    beginStep("Shutdown");
    await shutdown(browser);

    // kludge to log a final end message
    beginStep();
  } catch (err: any) {
    logger.error(`Fatal error during downloading process`);
    logger.error(`Last step was [${currentStep}]`);
    logger.error("---- Debugging Details -----");
    logger.error(err.message);
    logger.error(err);
    logger.error(err?.stack);
    logger.error("----------------------------");

    if (browser) {
      logger.error("Capturing debug screenshot to download-failed.jpg");
      try {
        await screenshot(browser.page, { path: "./download-failed.jpg" });
      } catch (err: any) {
        logger.error("Error attempting to capture screenshot");
        logger.error(err.message);
        logger.error(err);
        logger.error(err?.stack);
      }
      logger.error("Terminating");
      await shutdown(browser);
    }
  }
}

main();
