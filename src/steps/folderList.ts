import { PreparedBrowser } from "../browser";
import { logger } from "../logging";
import { foldersPage } from "../toyhouse";
import { folderTree } from "../util/db";
/**
 * Fetch and parse all folders from toyhouse. Utilizes the the
 * {@link folderTree} db.
 * @param browser
 */
export async function processFolderList({ page }: PreparedBrowser) {
  if (folderTree.exists()) {
    logger.info("Folders already cached. Continuing");
    return;
  }
  await page.goto(`https://toyhou.se/~folders`, { waitUntil: "networkidle2" });

  const { rootFolder, numFolders } = await page.evaluate(
    foldersPage.parseFolders
  );
  logger.info(`Found ${numFolders} folders`);
  await folderTree.set(rootFolder);
  logger.info(`Saved folders to ${folderTree.fileName()}`);
}
