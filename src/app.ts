import { PreparedBrowser, shutdown, startup } from "./browser";

import { logger } from "./logging";
import { loginToToyhouse } from "./toyhouse.puppeteer";
import { browserCookies } from "./util/db";
import { mkdir } from "./util/mkdir";
import { resolve, join } from "path";
import { processReadFolder } from "./steps/readFolder";
import {
  applyUpdate,
  cleanupUpdateScript,
  promptForAutoUpdate,
} from "./updater/update";
/**
 * Toyhouse downloader entry point.
 */
async function main() {
  // auto update
  await cleanupUpdateScript();
  if (await promptForAutoUpdate()) {
    return applyUpdate();
  }
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

    logger.info("[Shutdown]");
    await shutdown(browser);
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

main().catch((err) => {
  logger.error("Fatal error during run");
  logger.error("Name: " + err.name);
  logger.error("Error Kind: " + err.constructor.name);
  logger.error("Message: " + err.message);
  logger.error(err.stack);
  process.exitCode = 1;
});
