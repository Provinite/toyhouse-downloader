import pkg from "../../package.json";
import { compareSemVer } from "../util/semVer";
import { type, tmpdir } from "os";
import { logger } from "../logging";
import { createInterface } from "readline/promises";
import { stdin, stdout, pid, cwd } from "process";
import { dirname, sep } from "path";
import * as path from "path";
import { Readable } from "stream";
import { mkdtemp, unlink, rmdir, copyFile } from "fs/promises";
import { createWriteStream } from "fs";
import { finished } from "stream/promises";
import { ChildProcess, spawn } from "child_process";

import type * as streamWeb from "stream/web";
declare global {
  interface Response {
    readonly body: streamWeb.ReadableStream<Uint8Array> | null;
  }
}

/**
 * Get the current version of the application
 * @returns The current version of the application
 */
export function getCurrentVersion() {
  return pkg.version;
}

/**
 * Get the latest version from the repository
 * @returns The latest version from the repository
 */
export async function fetchLatestVersion() {
  const [protocol, scope, repo] = pkg.repository.split(/[:/]/g);
  // we only support github:user/repo, so blow up early if that's not the case
  if (protocol !== "github") {
    throw new Error(
      `Unrecognized repository definition in package.json. Expected "github:user/repo"`
    );
  }
  if (!scope || !repo) {
    throw new Error(
      `Unrecognized repository definition in package.json. Expected "github:user/repo"`
    );
  }
  const branch = pkg.toyHouseDownloader.branch || "main";
  const url = `https://raw.githubusercontent.com/${scope}/${repo}/${branch}/package.json`;
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    logger.error(`Failed to download ${url}`);
    logger.error(`HTTP ${response.status}: ${response.statusText}`);
    throw new Error(`Failed to fetch latest release info [${response.status}]`);
  }

  const data = await response.json();
  return data.version ?? "0.0.0";
}

/**
 * Determine if the current version is behind the specified version
 * @param latestVersion The latest version to compare against
 * @returns true if the application is out-of-date
 * @see {@link fetchLatestVersion}
 */
export function shouldUpdate(latestVersion: string): boolean {
  const currentVersion = getCurrentVersion();
  return compareSemVer(currentVersion, latestVersion) < 0;
}

/**
 * Supported platforms for the application
 */
export enum Platform {
  Windows,
  Linux,
  Macos,
}

/**
 * Get the platform of the current system, so we can download the correct
 * binary.
 * @returns The {@link Platform} of the current system
 */
export function getPlatform(): Platform {
  const osType = type();
  const platform = {
    ["Windows_NT"]: Platform.Windows,
    ["Linux"]: Platform.Linux,
    ["Darwin"]: Platform.Macos,
  }[osType];
  if (platform === undefined) {
    throw new Error(`Unknown platform: ${osType}. Cannot auto-update.`);
  }
  return platform;
}

export async function downloadLatestRelease(platform: Platform) {
  const [protocol, scope, repo] = pkg.repository.split(/[:/]/g);
  if (protocol !== "github") {
    throw new Error(
      `Unrecognized repository definition in package.json. Expected "github:user/repo"`
    );
  }
  if (!scope || !repo) {
    throw new Error(
      `Unrecognized repository definition in package.json. Expected "github:user/repo"`
    );
  }
  const branch = pkg.toyHouseDownloader.branch || "main";
  const binaryName = {
    [Platform.Windows]: "toyhouse-downloader-win-x64.zip",
    [Platform.Linux]: "toyhouse-downloader-linux-x64.zip",
    [Platform.Macos]: "toyhouse-downloader-macos-x64.zip",
  }[platform];
  if (!binaryName) {
    throw new Error("Unrecognized platform. No binary available for download.");
  }

  const url = `https://github.com/${scope}/${repo}/raw/${branch}/dist/${binaryName}`;
  logger.info(
    `Downloading latest release from ${url}. This might take a couple of minutes...`
  );
  const response = await fetch(url);
  if (!response.ok) {
    logger.error(`Failed to download latest release from ${url}`);
    logger.error(`HTTP ${response.status}: ${response.statusText}`);
    throw new Error(`Failed to fetch latest binary [${response.status}]`);
  }
  const osTmpDir = tmpdir();
  const tmpDirPrefix = "toyhouse-downloader-";
  const directory = await mkdtemp(path.join(osTmpDir, tmpDirPrefix));
  const outFilePath = path.join(directory, binaryName);
  const outStream = createWriteStream(outFilePath);
  await finished(Readable.fromWeb(response.body!).pipe(outStream));
  logger.info(`Downloaded latest release to "${outFilePath}"`);
  return {
    zipFileName: outFilePath,
    cleanup: () => cleanupTempFile(outFilePath),
  };
}

export async function cleanupTempFile(filePath: string) {
  await unlink(filePath);
  await rmdir(dirname(filePath), { recursive: false });
}

/**
 * Check if there is a new version available and prompt the user to update
 * @returns true if an update should be performed
 */
export async function promptForAutoUpdate() {
  logger.info(
    `Current version is ${getCurrentVersion()}. Checking for updates...`
  );
  const latestVersion = await fetchLatestVersion();
  const needsUpdate = shouldUpdate(latestVersion);
  if (!needsUpdate) {
    logger.info("Already on latest version.");
    return;
  }
  const rl = createInterface({ input: stdin, output: stdout });
  logger.info(
    `New version available: ${latestVersion}. Current version is ${getCurrentVersion()}`
  );
  let promptResult: string = "";
  do {
    if (promptResult) {
      logger.error("Invalid input. Please enter 'y' or 'n'");
    }
    promptResult = await rl.question("Update? [y/n]: ");
    promptResult = promptResult.trim().toLowerCase();
  } while (promptResult !== "y" && promptResult !== "n");
  rl.close();
  return promptResult === "y";
}

/**
 * Extract the update apply script to the current working directory
 * from the bundled application assets.
 * @note An update application script is used to apply the update to
 *  avoid the application trying to overwrite itself while running.
 *
 * @see {@link "./apply-update.sh"} and {@link "./apply-update.bat"}
 * for the update apply scripts themselves.
 *
 * @returns The path to the extracted update apply script
 */
export async function createUpdateApplyScript() {
  const platform = getPlatform();
  let srcPath: string;
  let destPath: string;
  if (platform === Platform.Windows) {
    srcPath = path.join(__dirname, "apply-update.bat");
    destPath = path.join(".", "apply-update.bat");
  } else {
    srcPath = path.join(__dirname, "apply-update.sh");
    destPath = path.join(".", "apply-update.sh");
  }
  await copyFile(srcPath, destPath);
  return destPath.startsWith(".") ? destPath : `.${sep}${destPath}`;
}

/**
 * Apply the update by downloading the latest release and running the
 * update apply script.
 * @returns true if the update was applied successfully
 */
export async function applyUpdate() {
  const latest = await downloadLatestRelease(getPlatform());
  const updateScriptPath = await createUpdateApplyScript();
  logger.info(`Applying update with script at ${updateScriptPath}`);
  let child: ChildProcess;
  if (getPlatform() === Platform.Windows) {
    child = spawn(
      "cmd.exe",
      [
        "/s",
        "/c",
        `"powershell ""${updateScriptPath}" "${latest.zipFileName}" ${pid} ^| tee update.log"; exit $LASTEXITCODE"`,
      ],
      {
        shell: true,
        detached: true,
        stdio: "ignore",
        cwd: cwd(),
        windowsVerbatimArguments: true,
        windowsHide: false,
      }
    );
  } else {
    child = spawn(
      "sh",
      [
        updateScriptPath,
        `"${latest.zipFileName}"`,
        `"${pid}"`,
        "|",
        "tee",
        "update.log",
      ],
      {
        shell: true,
        detached: true,
        stdio: "inherit",
        cwd: cwd(),
      }
    );
  }

  child.unref();

  // ["close", "disconnect", "error", "exit", "spawn"].forEach((event) => {
  //   child.on(event, (...args) => {
  //     console.log({ event, args });
  //   });
  // });

  const onSpawn = () => {
    logger.info("Update script started. Exiting...");
    spawned = true;
    child.off("spawn", onSpawn);
  };
  child.on("spawn", onSpawn);

  // child.stdout?.pipe(stdout);
  // child.stderr?.pipe(stdout);

  let spawned = false;
  while (!spawned) {
    await new Promise((resolve) => {
      logger.info("Waiting for update apply script to start...");
      setTimeout(resolve, 500);
    });
  }

  process.on("beforeExit", () => {
    console.log("Toyhouse downloader exiting");
  });

  return true;
}

export async function cleanupUpdateScript() {
  const updateScriptPath = path.join(
    ".",
    `apply-update.${getPlatform() === Platform.Windows ? "bat" : "sh"}`
  );
  try {
    await unlink(updateScriptPath);
  } catch (err: any) {
    if (err?.code === "ENOENT") {
      return;
    }
    throw err;
  }
}
