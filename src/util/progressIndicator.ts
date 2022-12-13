import { padLeft } from "./padString";

export function progressIndicator(
  index: number,
  max: number,
  offset: number = 0
) {
  const indexString = (index + offset).toString();
  const displayIndex = padLeft(indexString, max.toString().length, "0");
  return `(${displayIndex}/${max})`;
}
