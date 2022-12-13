import { PreparedBrowser } from "../browser";
import { Character, characterDetail } from "../util/db";
import { promises as fs, existsSync } from "fs";
import { logger } from "../logging";
import { progressIndicator } from "../util/progressIndicator";
import { mkdir } from "../util/mkdir";
import { join, resolve } from "path";
import { padRight } from "../util/padString";

/**
 * [Image Crawl] step
 * Processes gallery entries in all character details, downloading any
 * images that have not yet been downloaded.
 * @param browser
 * @param characters
 */
export async function imageCrawl(
  { page }: PreparedBrowser,
  characters: Character[]
) {
  for (
    let characterIndex = 0;
    characterIndex < characters.length;
    characterIndex++
  ) {
    const outerProgress = progressIndicator(characterIndex, characters.length);

    const { id, name } = characters[characterIndex];
    const character = await characterDetail.get(id);

    logger.info(`${outerProgress} Start ${name} (${id})`);
    if (!character || !character.gallery) {
      throw new Error(
        `Character ${name} (${id}) gallery metadata not found during image crawl`
      );
    }

    if (!character.gallery.images.length) {
      logger.info(
        `${outerProgress} No images found for character ${name} (${id}). Continuing`
      );
      continue;
    }
    await mkdir(resolve(join(".", "characters", "galleries", id)));

    for (
      let imageIndex = 0;
      imageIndex < character.gallery.images.length;
      imageIndex++
    ) {
      const innerProgress = `${progressIndicator(
        characterIndex,
        characters.length
      )} ${progressIndicator(imageIndex, character.gallery.images.length)}`;

      const image = character.gallery.images[imageIndex];

      const fileName = getFileName(image.url);
      if (!isValidFileName(fileName)) {
        throw new Error(`Invalid file name: ${fileName} in gallery`);
      }

      const fullFileName = resolve(
        join(".", "characters", "galleries", id, fileName)
      );
      if (existsSync(fullFileName)) {
        logger.info(`${innerProgress} Already downloaded ${fileName}`);
        continue;
      }
      const response = await page.goto(image.url, {
        waitUntil: "networkidle0",
      });

      await fs.writeFile(fullFileName, await response!.buffer());
      logger.info(`${innerProgress} Saved ${fileName} to ${fullFileName}`);
    }
  }
}

/**
 * Get the filename from a url.
 * @param url
 * @returns The last url segment, excluding query
 */
function getFileName(url: string) {
  return url.substring(url.lastIndexOf("/") + 1).split("?")[0];
}

/**
 * Determine if a file name is acceptable to save.
 * @param str
 * @returns True if string is alphanumeric possibly with underscores,
 * dashes, and periods.
 */
function isValidFileName(str: string) {
  return /[a-zA-Z0-9_.-]/.test(str);
}
