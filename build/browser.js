"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshot = exports.shutdown = exports.startup = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const logging_1 = require("./logging");
const db_1 = require("./util/db");
const chromium_1 = __importDefault(require("chromium"));
const config_1 = __importDefault(require("chromium/config"));
const path_1 = require("path");
const config_2 = require("./config");
/**
 * Start up a puppeteer browser, launch a new page. Attaches
 * debug logging and loads cookies from cache.
 */
async function startup() {
    const config = await (0, config_2.getConfig)();
    const chromiumPath = (0, path_1.resolve)((0, path_1.join)(".", "chromium"));
    logging_1.logger.info(`Installing chromium to ${chromiumPath}`);
    config_1.default.BIN_OUT_PATH = chromiumPath;
    await chromium_1.default.install();
    logging_1.logger.info(`Starting chrome from ${chromium_1.default.path}`);
    const browser = await puppeteer_1.default.launch({
        args: ["--headless", `--window-size=${config.virtualScreenSize}`],
        defaultViewport: null,
        executablePath: chromium_1.default.path,
    });
    const page = await browser.newPage();
    page.on("domcontentloaded", () => logging_1.logger.debug(`Navigated to ${page.url()}`));
    const cachedCookies = await db_1.browserCookies.get();
    if (cachedCookies) {
        logging_1.logger.info(`Loaded ${cachedCookies.length} cookies from cache`);
        await page.setCookie(...cachedCookies);
    }
    await page.setRequestInterception(true);
    let allowImages = false;
    const result = {
        browser,
        page,
        setLoadImages: (show) => (allowImages = show),
    };
    page.on("request", (req) => {
        if (req.resourceType() === "image" && !allowImages) {
            req.abort();
        }
        else {
            req.continue();
        }
    });
    return result;
}
exports.startup = startup;
/**
 * Save cookies to the cache and shutdown the puppeteer
 * browser
 */
async function shutdown({ browser }) {
    logging_1.logger.info(`Shutting down`);
    await browser.close();
}
exports.shutdown = shutdown;
async function screenshot(page, options = {}) {
    const config = await (0, config_2.getConfig)();
    logging_1.logger.info(options.path
        ? `Saving screenshot of ${page.url()} to ${options.path}`
        : `Taking screenshot of ${page.url()}`);
    return page.screenshot({
        type: "jpeg",
        fullPage: true,
        quality: config.profileScreenshotQuality,
        ...options,
    });
}
exports.screenshot = screenshot;
