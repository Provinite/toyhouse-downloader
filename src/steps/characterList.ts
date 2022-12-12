import type { Page } from "puppeteer";
import { logger } from "../logging";
import {
  allCharacterList,
  extractCharacterIdFromUrl,
  homePage,
} from "../toyhouse";
import { Character, characterList } from "../util/db";

/**
 * Generate a character list. Expects browser to be on
 * the toyhouse homepage and logged in.
 * @param page
 */
export async function processCharacterList(page: Page) {
  // onward to the character list
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
      `Found ${charactersOnPage.length} characters on page ${currentPage}/${pageCount}`
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

  return characters;
}
