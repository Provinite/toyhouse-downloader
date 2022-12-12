import { promises as fs } from "fs";
import { jsonc } from "jsonc";
import { resolve, join } from "path";
export interface Config {
  username: string;
  password: string;
  profileScreenshots: boolean;
  profileScreenshotQuality: number;
  virtualScreenSize: string;
}

let config: Config | null = null;
export async function getConfig(): Promise<Config> {
  if (config) {
    return { ...config };
  } else {
    const configData = await fs.readFile(
      resolve(join(".", "config.jsonc")),
      "utf8"
    );
    config = jsonc.parse(configData, {
      stripComments: true,
    });
    return getConfig();
  }
}
