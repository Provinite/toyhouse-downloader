import { PreparedBrowser, screenshot } from "../browser";
import { logger } from "../logging";
import { characterPage } from "../toyhouse";
import { progressIndicator } from "../util/progressIndicator";
import { Character, characterDetail, DetailedCharacter } from "../util/db";
import { getConfig } from "../config";

/**
 * [Character Crawl] step
 * Iterates through the character list, creating character
 * detail entries for each character, as well as profile
 * screenshots.
 * @param browser
 * @param characters
 */
export async function processCharacterCrawl(
  { page }: PreparedBrowser,
  characters: Character[]
) {
  const config = await getConfig();
  for (
    let characterIndex = 0;
    characterIndex < characters.length;
    characterIndex++
  ) {
    const progress = progressIndicator(characterIndex, characters.length);
    const { url, id, name } = characters[characterIndex];

    if (characterDetail.exists(id)) {
      logger.info(
        `${progress} Character metadata for ${name} (${id}) already cached. Continuing`
      );
      continue;
    }

    logger.info(`${progress} Crawling character`);
    const nav = page.goto(url, { waitUntil: "networkidle2" });

    await nav;
    const [characterName, profileContents, fields, folderUrl] =
      await Promise.all([
        page.evaluate(characterPage.getName),
        page.evaluate(characterPage.getProfileContents),
        page.evaluate(characterPage.getFields),
        page.evaluate(characterPage.getFolderUrl),
      ]);

    if (!characterName) {
      throw new Error(`Unable to get character name on ${page.url()}`);
    }
    logger.info(`Loaded profile for ${characterName}`);

    const character: DetailedCharacter = {
      id,
      url,
      name: characterName,
      folderUrl,
      fields,
      profileContent: profileContents ?? null,
    };

    await Promise.all([
      config.profileScreenshots
        ? screenshot(page, {
            path: `./characters/${id}-profile.jpg`,
          })
        : Promise.resolve(),
      characterDetail.set(id, character),
    ]);

    logger.info(
      `${progress} Saved ${character.name} (${
        character.id
      }) to ${characterDetail.fileName(id)} ${
        character.fields.length
      } field(s), ${character.profileContent ? "with" : "no"} profile`
    );
  }
}
