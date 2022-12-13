import type { Page } from "puppeteer";
import { logger } from "../logging";
import {
  allCharacterList,
  extractCharacterIdFromUrl,
  homePage,
} from "../toyhouse";
import { Character, characterList } from "../util/db";
import { progressIndicator } from "../util/progressIndicator";

/**
 * [Character List] step
 * Generate a character list. Expects browser to be on
 * the toyhouse homepage and logged in. Sets up the lightweight
 * characterlist db entry for consumption by other processes.
 * @param page
 */
export async function processCharacterList(page: Page) {
  // navigate to the user's all characters page
  const profileLink = await page.evaluate(homePage.getNavLinkUrl, "Profile");
  await page.goto(`${profileLink}/characters/folder:all?page=1`, {
    waitUntil: "networkidle2",
  });

  const pageCount = await page.evaluate(allCharacterList.getPageCount);
  logger.info(`Processing ${pageCount} pages`);

  const characters: Character[] = [];

  for (let currentPage = 1; currentPage <= pageCount; currentPage++) {
    if (currentPage > 1) {
      await page.goto(
        `${profileLink}/characters/folder:all?page=${currentPage}`,
        {
          waitUntil: "networkidle2",
        }
      );
    }
    const charactersOnPage = await page.evaluate(
      allCharacterList.getCharactersFromPage
    );

    logger.info(
      `${progressIndicator(currentPage, pageCount, 0)} Found ${
        charactersOnPage.length
      } characters on page ${currentPage}`
    );

    charactersOnPage.forEach((c) => {
      const id = extractCharacterIdFromUrl(c.url);
      if (!id) {
        throw new Error(
          `Error determining character id from url ${c.url} (character: ${c.name})`
        );
      }
      characters.push({ ...c, id });
    });
  }

  await characterList.set(characters);
  logger.info(`Successfully indexed ${characters.length} total character(s)`);
  return characters;
}
