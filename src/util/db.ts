import { promises as fs, existsSync } from "fs";
import { Protocol } from "puppeteer";
import { join, resolve } from "path";

export const characterList = createDb<Character[], []>(() =>
  resolve(join(".", "characters", "characters.json"))
);

export const characterDetail = createDb<DetailedCharacter, [id: string]>(
  (id: string) => resolve(join(".", "characters", `${id}.json`))
);

export const browserCookies = createDb<Protocol.Network.Cookie[], []>(() =>
  resolve(join(".", "cookies.json"))
);

function createGetter<T, A extends any[]>(fileName: (...args: A) => string) {
  return async (...args: A): Promise<T | null> => {
    try {
      return JSON.parse(await fs.readFile(fileName(...args), "utf8"));
    } catch (err) {
      return null;
    }
  };
}

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

function createExists<A extends any[]>(fileName: (...args: A) => string) {
  return (...args: A) => existsSync(fileName(...args));
}

function createDb<T, A extends any[]>(fileName: (...args: A) => string) {
  return {
    get: createGetter<T, A>(fileName),
    set: createSetter<T, A>(fileName),
    exists: createExists<A>(fileName),
    fileName,
  };
}

export interface Character {
  name: string;
  url: string;
  id: string;
}

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

export interface GalleryImage {
  url: string;
  credits: string[];
  uploadDate: string;
  subGalleryName: string | null;
  subGalleryUrl: string | null;
}

export interface Field {
  name: string;
  value: string;
}
