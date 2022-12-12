import puppeteer, { Browser, Page, ScreenshotOptions } from "puppeteer";
import { logger } from "./logging";
import { browserCookies } from "./util/db";

/**
 * Start up a puppeteer browser, launch a new page. Attaches
 * debug logging and loads cookies from cache.
 */
export async function startup(): Promise<PreparedBrowser> {
  const browser = await puppeteer.launch({
    args: ["--headless", "--window-size=1920,1080"],
    defaultViewport: null,
  });
  const page = await browser.newPage();
  page.on("domcontentloaded", () => logger.debug(`Navigated to ${page.url()}`));
  const cachedCookies = await browserCookies.get();

  if (cachedCookies) {
    logger.info(`Loaded ${cachedCookies.length} cookies from cache`);
    await page.setCookie(...cachedCookies);
  }

  await page.setRequestInterception(true);

  let allowImages: boolean = false;
  const result: PreparedBrowser = {
    browser,
    page,
    setLoadImages: (show: boolean) => (allowImages = show),
  };
  page.on("request", (req) => {
    if (req.resourceType() === "image" && !allowImages) {
      req.abort();
    } else {
      req.continue();
    }
  });
  return result;
}

/**
 * Save cookies to the cache and shutdown the puppeteer
 * browser
 */
export async function shutdown({ page, browser }: PreparedBrowser) {
  const cookies = await page.cookies();
  logger.info(`Caching ${cookies.length} cookies`);
  await browserCookies.set(cookies);
  logger.info(`Shutting down`);
  await browser.close();
}

export function screenshot(page: Page, options: ScreenshotOptions = {}) {
  logger.info(
    options.path
      ? `Saving screenshot of ${page.url()} to ${options.path}`
      : `Taking screenshot of ${page.url()}`
  );
  return page.screenshot({
    type: "jpeg",
    fullPage: true,
    quality: 25,
    ...options,
  });
}

export interface PreparedBrowser {
  browser: Browser;
  page: Page;
  setLoadImages: (show: boolean) => void;
}
