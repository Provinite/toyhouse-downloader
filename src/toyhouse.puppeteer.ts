import { Page } from "puppeteer";
import { logger } from "./logging";
import credentials from "./credentials.json";
import { homePage } from "./toyhouse";

/**
 * Navigate to toyhouse homepage and login if necessary
 * @param page
 */
export async function loginToToyhouse(page: Page) {
  await page.goto("https://toyhou.se", {
    waitUntil: "networkidle2",
  });
  const loggedIn = await page.evaluate(homePage.isLoggedIn);
  if (!loggedIn) {
    logger.info(`Not logged in. Logging in as ${credentials.username}`);
    // log in
    await page.waitForSelector(homePage.usernameFieldSelector);
    await page.evaluate(
      homePage.login,
      credentials.username,
      credentials.password
    );
    await page.waitForNavigation();
  } else {
    logger.info(`Already logged in with cached cookies`);
  }
}
