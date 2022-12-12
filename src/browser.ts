import puppeteer, { Browser, Page, ScreenshotOptions } from "puppeteer";
import { logger } from "./logging";
import { browserCookies } from "./util/db";
import chromium from "chromium";
import chromiumConfig from "chromium/config";
import { join, resolve } from "path";
import { getConfig } from "./config";
/**
 * Start up a puppeteer browser, launch a new page. Attaches
 * debug logging and loads cookies from cache.
 */
export async function startup(): Promise<PreparedBrowser> {
  const config = await getConfig();
  const chromiumPath = resolve(join(".", "chromium"));
  logger.info(`Installing chromium to ${chromiumPath}`);
  chromiumConfig.BIN_OUT_PATH = chromiumPath;
  await chromium.install();
  logger.info(`Starting chrome from ${chromium.path}`);

  const browser = await puppeteer.launch({
    args: ["--headless", `--window-size=${config.virtualScreenSize}`],
    defaultViewport: null,
    executablePath: chromium.path,
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
export async function shutdown({ browser }: PreparedBrowser) {
  logger.info(`Shutting down`);
  await browser.close();
}

export async function screenshot(page: Page, options: ScreenshotOptions = {}) {
  const config = await getConfig();
  logger.info(
    options.path
      ? `Saving screenshot of ${page.url()} to ${options.path}`
      : `Taking screenshot of ${page.url()}`
  );
  return page.screenshot({
    type: "jpeg",
    fullPage: true,
    quality: config.profileScreenshotQuality,
    ...options,
  });
}

export interface PreparedBrowser {
  browser: Browser;
  page: Page;
  setLoadImages: (show: boolean) => void;
}
