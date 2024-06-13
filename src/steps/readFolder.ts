import { PreparedBrowser } from "../browser";
import { getConfig } from "../config";
import { logger } from "../logging";
import { characterTradeListingConfigPage, folderPage } from "../toyhouse";

export const processReadFolder = async ({ page }: PreparedBrowser) => {
  const { bumpFolderUrl } = await getConfig();
  await page.goto(bumpFolderUrl, {
    waitUntil: "networkidle2",
  });
  logger.info(`Navigated to ${bumpFolderUrl}`);
  const characters = await page.evaluate(folderPage.getCharacterList);
  logger.info(`Found ${characters.length} characters`);
  for (const { id, url, isHidden, name } of characters) {
    if (isHidden) {
      logger.info(`Skipping ${name} because it is hidden`);
      continue;
    } else {
      const sleep = new Promise((res) => setTimeout(res, 200));
      await page.goto(`https://toyhou.se/~characters/trade-listing/${id}`, {
        waitUntil: "networkidle2",
      });

      logger.info(`Opened trade settings for ${name}`);

      const isForSale = await page.evaluate(
        characterTradeListingConfigPage.isForCashSale
      );

      logger.info(
        `${name} ${isForSale ? "is" : "is not"} already marked for sale`
      );

      if (isForSale) {
        const nav = page.waitForNavigation();
        await page.evaluate(
          characterTradeListingConfigPage.markForCashSale,
          false
        );
        await nav;
        logger.info(`Marked ${name} not for sale`);
      }

      const nav = page.waitForNavigation();
      await page.evaluate(
        characterTradeListingConfigPage.markForCashSale,
        true
      );
      await nav;
      logger.info(`Marked ${name} for sale`);
      await sleep;
    }
  }
};
