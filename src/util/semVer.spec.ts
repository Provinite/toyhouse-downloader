import { compareSemVer, parseSemVer } from "./semVer";

describe("semVer", () => {
  describe("parseSemVer", () => {
    it.each([
      ["4.2.0-rc1", 4, 2, 0, "rc1"],
      ["1.2.3", 1, 2, 3, undefined],
    ])(
      "parses %p into major: %p, minor: %p, patch: %p, postfix: %p",
      (semVer, major, minor, patch, postfix) => {
        const result = parseSemVer(semVer);
        expect(result).toEqual({
          major,
          minor,
          patch,
          postfix,
        });
      }
    );

    it.each(["24.beta", "prerelease", "1", "1.2", "1.2.alpha"])(
      "throws for %p",
      (semVer) => {
        expect(() => parseSemVer(semVer)).toThrowErrorMatchingSnapshot();
      }
    );
  });
  describe("compareSemVer", () => {
    it.each([
      ["1.0.0", "2.0.0"],
      ["1.0.0", "1.0.1"],
      ["1.0.0", "1.1.0"],
      ["1.0.0", "1.1.1"],
      ["0.0.0", "1.0.0"],
      ["0.0.0", "2.0.1"],
      ["0.99.99", "1.0.0"],
    ])("orders %p before %p", (lesser, greater) => {
      expect(compareSemVer(greater, lesser)).toBeGreaterThan(0);
      expect(compareSemVer(lesser, greater)).toBeLessThan(0);
    });
    it.each([
      ["1.0.0", "1.0.0"],
      ["1.0.0-alpha", "1.0.0-beta"],
      ["1.0.0-alpha", "1.0.0-alpha"],
    ])("orders %p equal to %p", (a, b) => {
      expect(compareSemVer(a, b)).toBe(0);
      expect(compareSemVer(b, a)).toBe(0);
    });
  });
});
