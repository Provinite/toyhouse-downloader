/**
 * Pad the left side of a string to the specified length
 * @param str
 * @param len
 * @param pad
 * @returns The padded string
 */
export function padLeft(str: string, len: number, pad = " ") {
  return `${getPadding(str, len, pad)}${str}`;
}
/**
 * Pad the right side of a string to the specified length
 * @param str
 * @param len
 * @param pad
 * @returns The padded string
 */
export function padRight(str: string, len: number, pad = " ") {
  return `${str}${getPadding(str, len, pad)}`;
}

/**
 * Generate just the padding necessary to pad `str`
 * to a length of `len`
 * @param str
 * @param len
 * @param pad
 * @returns A string that, when concatenated with `str`,
 *  results in a string of length `len`.
 */
function getPadding(str: string, len: number, pad: string) {
  return pad.repeat(Math.max(0, len - str.length));
}
