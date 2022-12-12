export function padLeft(str: string, len: number, pad = " ") {
  return `${getPadding(str, len, pad)}${str}`;
}

export function padRight(str: string, len: number, pad = " ") {
  return `${str}${getPadding(str, len, pad)}`;
}

function getPadding(str: string, len: number, pad: string) {
  return pad.repeat(Math.max(0, len - str.length));
}
