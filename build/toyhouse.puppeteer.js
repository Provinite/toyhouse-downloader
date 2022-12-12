"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginToToyhouse = void 0;
const config_1 = require("./config");
const logging_1 = require("./logging");
const toyhouse_1 = require("./toyhouse");
/**
 * Navigate to toyhouse homepage and login if necessary
 * @param page
 */
async function loginToToyhouse(page) {
    const config = await (0, config_1.getConfig)();
    await page.goto("https://toyhou.se", {
        waitUntil: "networkidle2",
    });
    const loggedIn = await page.evaluate(toyhouse_1.homePage.isLoggedIn);
    if (!loggedIn) {
        logging_1.logger.info(`Not logged in. Logging in as ${config.username}`);
        await page.waitForSelector(toyhouse_1.homePage.usernameFieldSelector);
        await page.evaluate(toyhouse_1.homePage.login, config.username, config.password);
        await page.waitForNavigation({ waitUntil: "networkidle2" });
        if (page.url().endsWith("/~account/login")) {
            throw new Error("Error logging in. Please check your username and password");
        }
    }
    else {
        logging_1.logger.info(`Already logged in with cached cookies`);
    }
}
exports.loginToToyhouse = loginToToyhouse;
