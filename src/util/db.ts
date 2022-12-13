import { promises as fs, existsSync } from "fs";
import { Protocol } from "puppeteer";
import { join, resolve } from "path";
import { FolderTree } from "../toyhouse";

/**
 * Character list database. Provides a lightweight index for
 * all characters.
 */
export const characterList = createDb<Character[], []>(() =>
  resolve(join(".", "characters", "characters.json"))
);

export interface Character {
  name: string;
  url: string;
  id: string;
}

export const folderTree = createDb<FolderTree, []>(() =>
  resolve(join(".", "characters", "folders.json"))
);
export function crawlFolderTree(
  folder: FolderTree,
  onEnter: (folder: FolderTree) => void = () => {},
  onExit: (folder: FolderTree) => void = () => {}
) {
  onEnter(folder);
  folder.children.forEach((folder) => crawlFolderTree(folder, onEnter, onExit));
  onExit(folder);
}

/**
 * Character detail database. Stores more detailed character
 * and gallery information for each character.
 */
export const characterDetail = createDb<DetailedCharacter, [id: string]>(
  (id: string) => resolve(join(".", "characters", `${id}.json`))
);

export interface DetailedCharacter {
  id: string;
  name: string;
  fields: Field[];
  profileContent: string | null;
  url: string;
  folderUrl: string | null;
  gallery?: {
    images: GalleryImage[];
  };
}

export interface Field {
  name: string;
  value: string;
}

export interface GalleryImage {
  url: string;
  credits: string[];
  uploadDate: string;
  subGalleryName: string | null;
  subGalleryUrl: string | null;
}

/**
 * Browser cookies database. Stores browser cookies between
 * sessions to avoid unnecessary logins.
 */
export const browserCookies = createDb<Protocol.Network.Cookie[], []>(() =>
  resolve(join(".", "cookies.json"))
);

/**
 * Create a JSON db getter
 * @param fileName Filename generator function
 * @returns
 */
function createGetter<T, A extends any[]>(fileName: (...args: A) => string) {
  return async (...args: A): Promise<T | null> => {
    try {
      return JSON.parse(await fs.readFile(fileName(...args), "utf8"));
    } catch (err) {
      return null;
    }
  };
}

/**
 * Create a JSON db setter
 * @param fileName Filename generator function
 * @returns A function that allows writes to the database
 *  specified by the `fileName` callback.
 */
function createSetter<T, A extends any[]>(fileName: (...args: A) => string) {
  return (...args: [...args: A, value: T]): Promise<void> => {
    const fileNameArgs: A = args.slice(0, -1) as A;
    const value: T = args[args.length - 1];
    return fs.writeFile(
      fileName(...fileNameArgs),
      JSON.stringify(value, null, 2),
      "utf8"
    );
  };
}

/**
 * Create a JSON db exists function.
 * @param fileName Filename generator function
 * @returns A function that returns true if the specified json db file
 *  exists.
 */
function createExists<A extends any[]>(fileName: (...args: A) => string) {
  return (...args: A) => existsSync(fileName(...args));
}

/**
 * Create a json db
 * @param fileName Filename generator function
 * @returns
 */
function createDb<T, A extends any[]>(fileName: (...args: A) => string) {
  return {
    get: createGetter<T, A>(fileName),
    set: createSetter<T, A>(fileName),
    exists: createExists<A>(fileName),
    fileName,
  };
}
