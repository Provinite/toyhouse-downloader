import { Page } from "puppeteer";
import { getConfig } from "./config";
import { logger } from "./logging";
import { homePage } from "./toyhouse";

/**
 * Navigate to toyhouse homepage and login if necessary
 * @param page
 */
export async function loginToToyhouse(page: Page) {
  const config = await getConfig();
  await page.goto("https://toyhou.se", {
    waitUntil: "networkidle2",
  });
  const loggedIn = await page.evaluate(homePage.isLoggedIn);
  if (!loggedIn) {
    logger.info(`Not logged in. Logging in as ${config.username}`);
    await page.waitForSelector(homePage.usernameFieldSelector);
    await page.evaluate(homePage.login, config.username, config.password);
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    if (page.url().endsWith("/~account/login")) {
      throw new Error(
        "Error logging in. Please check your username and password"
      );
    }
  } else {
    logger.info(`Already logged in with cached cookies`);
  }
}
