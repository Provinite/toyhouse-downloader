import { promises as fs } from "fs";
export async function mkdir(path: string) {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (err: any) {
    if (err && err.code === "EEXIST") return;
    throw err;
  }
}
