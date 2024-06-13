import { promises as fs } from "fs";
import { jsonc } from "jsonc";
import { resolve, join } from "path";
export interface Config {
  username: string;
  password: string;
  bumpFolderUrl: string;
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
    validateConfig(config);
    return getConfig();
  }
}

const validationConfig: Record<keyof Config, (val: any) => void> = {
  username: validateUsername,
  password: validatePassword,
  profileScreenshots: validateProfileScreenshots,
  profileScreenshotQuality: validateProfileScreenshotQuality,
  virtualScreenSize: validateVirtualScreenSize,
  bumpFolderUrl: validateBumpFolderUrl,
};

function validateConfig(config: any) {
  assert(
    isTruthy(config) && isObject(config),
    () => new InvalidConfigurationError(`Invalid configuration object`)
  );

  const didValidate: Partial<Record<keyof Config, boolean>> = {};
  for (const [key, value] of Object.entries(config)) {
    if (Object.hasOwn(validationConfig, key)) {
      const configKey = key as keyof Config;
      validationConfig[configKey](value);
      didValidate[configKey] = true;
    } else {
      throw new InvalidConfigurationError(
        `Unexpected configuration option "${key}"`
      );
    }
  }

  for (const key of Object.keys(validationConfig)) {
    if (!didValidate[key as keyof Config]) {
      throw new InvalidConfigurationError(
        `Missing required configuration option: "${key}"`
      );
    }
  }
}

function validateUsername(username: any) {
  assert(
    isString(username) && isTruthy(username),
    () => new InvalidConfigurationError(`Invalid "username"`)
  );
}

function validatePassword(password: any) {
  assert(
    isString(password) && isTruthy(password),
    () => new InvalidConfigurationError(`Invalid "password"`)
  );
}

function validateProfileScreenshots(profileScreenshots: any) {
  assert(
    profileScreenshots === true || profileScreenshots === false,
    () =>
      new InvalidConfigurationError(
        `Invalid "profileScreenshots" setting. Must be one of true or false.`
      )
  );
}

function validateProfileScreenshotQuality(profileScreenshotQuality: any) {
  assert(
    isNumber(profileScreenshotQuality) &&
      !isNaN(profileScreenshotQuality) &&
      0 < profileScreenshotQuality &&
      100 >= profileScreenshotQuality &&
      Number.isInteger(profileScreenshotQuality),
    () =>
      new InvalidConfigurationError(
        `Invalid "profileScreenshotQuality" setting. Must be a whole number between 1 and 100.`
      )
  );
}

function validateVirtualScreenSize(virtualScreenSize: any) {
  assert(
    isString(virtualScreenSize) && /^\d+,\d+$/.test(virtualScreenSize),
    () =>
      new InvalidConfigurationError(
        `Invalid "virtualScreenSize" setting. Must be a string with a format like "1920,1080"`
      )
  );
}

function validateBumpFolderUrl(bumpFolderUrl: any) {
  assert(isString(bumpFolderUrl));
}

const isType = (type: TypeOfResult, val: any) => {
  return typeof val === type;
};
const isString = isType.bind(null, "string");
const isNumber = isType.bind(null, "number");
const isObject = isType.bind(null, "object");
const isTruthy = (v: any) => Boolean(v);

function assert(
  condition: boolean,
  error = () => new Error("Assertion failed")
) {
  if (!condition) {
    throw error();
  }
}

class InvalidConfigurationError extends Error {
  constructor(message: string) {
    super(
      `Your configuration appears to be invalid, please check your \`config.jsonc\` file:
${message}`
    );
  }
}

const _ = typeof ({} as any);
type TypeOfResult = typeof _;
