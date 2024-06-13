import { Page } from "puppeteer";
import { screenshot } from "./browser";
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

    await page.goto("https://toyhou.se/~account/login", {
      waitUntil: "networkidle2",
    });
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    await sleep(1500);
    await page.waitForSelector(homePage.usernameFieldSelector);
    await page.evaluate(homePage.setUsername, config.username);
    await sleep(1500);
    await page.evaluate(homePage.setPassword, config.password);
    await sleep(1500);
    await page.evaluate(homePage.clickLogin);
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    if (page.url().endsWith("/~account/login")) {
      await screenshot(page, { path: "./debug.jpg" });
      throw new Error(
        "Error logging in. Please check your username and password"
      );
    }
  } else {
    logger.info(`Already logged in with cached cookies`);
  }
}
