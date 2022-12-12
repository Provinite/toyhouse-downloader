import { padLeft } from "./padString";

export function progressIndicator(index: number, max: number) {
  const indexString = (index + 1).toString();
  const displayIndex = padLeft(indexString, max.toString().length, "0");
  return `(${displayIndex}/${max})`;
}
