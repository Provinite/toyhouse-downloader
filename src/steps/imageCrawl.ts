import { PreparedBrowser } from "../browser";
import { Character, characterDetail } from "../util/db";
import { promises as fs, existsSync } from "fs";
import { logger } from "../logging";
import { progressIndicator } from "../util/progressIndicator";

export async function imageCrawl(
  { page }: PreparedBrowser,
  characters: Character[]
) {
  for (
    let characterIndex = 0;
    characterIndex < characters.length;
    characterIndex++
  ) {
    const { id, name } = characters[characterIndex];
    const character = await characterDetail.get(id);
    logger.info(
      `${progressIndicator(
        characterIndex,
        characters.length
      )} Processing character gallery images for ${name} (${id})`
    );
    if (!character || !character.gallery) {
      throw new Error(
        `Character ${name} (${id}) gallery metadata not found during image crawl`
      );
    }

    if (!character.gallery.images.length) {
      logger.info(
        `${progressIndicator(
          characterIndex,
          characters.length
        )} No images found for character ${name} (${id}). Continuing`
      );
      continue;
    }
    try {
      await fs.mkdir(`./characters/galleries/${id}/`, { recursive: true });
    } catch (err: any) {
      if (err && err.code === "EEXIST") return;
      throw err;
    }

    for (
      let imageIndex = 0;
      imageIndex < character.gallery.images.length;
      imageIndex++
    ) {
      const image = character.gallery.images[imageIndex];

      const fileName = getFileName(image.url);
      if (!isValidFileName(fileName)) {
        throw new Error(`Invalid file name: ${fileName} in gallery`);
      }

      const fullFileName = `./characters/galleries/${id}/${fileName}`;
      if (existsSync(fullFileName)) {
        logger.info(
          `${progressIndicator(
            characterIndex,
            characters.length
          )} image ${progressIndicator(
            imageIndex,
            character.gallery.images.length
          )} image ${fileName} already downloaded. Continuing`
        );
        continue;
      }
      const response = await page.goto(image.url, {
        waitUntil: "networkidle0",
      });

      await fs.writeFile(fullFileName, await response!.buffer());
      logger.info(
        `${progressIndicator(
          characterIndex,
          characters.length
        )} image ${progressIndicator(
          imageIndex,
          character.gallery.images.length
        )} Saved ${fileName} to ${fullFileName}`
      );
    }
  }
}

function getFileName(url: string) {
  return url.substring(url.lastIndexOf("/") + 1).split("?")[0];
}

function isValidFileName(str: string) {
  return /[a-zA-Z0-9_.-]/.test(str);
}
