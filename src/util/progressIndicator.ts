import { padLeft } from "./padString";

/**
 * Generate a nice progress indicator string for
 * a process at step `index` out of `max`
 * @param index The current progress
 * @param max The total # of steps
 * @param offset Adjust `index` by this amount before
 *  displaying. Defaults to `1`
 * @returns
 */
export function progressIndicator(
  index: number,
  max: number,
  offset: number = 1
) {
  const indexString = (index + offset).toString();
  const displayIndex = padLeft(indexString, max.toString().length, "0");
  return `(${displayIndex}/${max})`;
}
