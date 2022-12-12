import { PreparedBrowser } from "../browser";
import { logger } from "../logging";
import { gallery } from "../toyhouse";
import { progressIndicator } from "../util/progressIndicator";
import { Character, characterDetail } from "../util/db";

export async function processGalleryCrawl(
  { page }: PreparedBrowser,
  characters: Character[]
) {
  for (
    let characterIndex = 0;
    characterIndex < characters.length;
    characterIndex++
  ) {
    const { url, id, name } = characters[characterIndex];
    const cachedCharacter = await characterDetail.get(id);
    if (!cachedCharacter) {
      throw new Error(
        `Error reading character (${id}) from cache to add gallery`
      );
    }
    if (cachedCharacter.gallery) {
      logger.info(
        `${progressIndicator(
          characterIndex,
          characters.length
        )} Gallery already cached for character ${name} (${id}). Continuing`
      );
      continue;
    }
    logger.info(
      `${progressIndicator(
        characterIndex,
        characters.length
      )} Crawling gallery info`
    );
    await page.goto(`${url}/gallery`, {
      waitUntil: "networkidle2",
    });

    // PERF: save json & navigate in parallel
    const images = await page.evaluate(gallery.getImages);
    cachedCharacter.gallery = { images };
    characterDetail.set(id, cachedCharacter);
    logger.info(
      `Saved metadata for ${images.length}/${
        images.length
      } images in gallery to ${characterDetail.fileName(id)}`
    );
  }
}
