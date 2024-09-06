/**
 * Parse a semantic version string like 4.2.0-rc1
 * @param semVer The semantic version string to parse
 * @returns An object with the major, minor, patch as numeric values, and
 *  the postfix if present.
 */
export function parseSemVer(semVer: string): {
  major: number;
  minor: number;
  patch: number;
  postfix: string;
} {
  const pattern =
    /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<postfix>.+))?$/;
  const result = pattern.exec(semVer);
  if (!result) {
    throw new Error(`Invalid semantic version: ${semVer}`);
  }
  const { major, minor, patch, postfix } = result.groups!;
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    postfix,
  };
}

/**
 * Compare two semantic version strings. Since postfixes are not
 * considered in the comparison, 1.0.0-rc1 is considered equal to 1.0.0.
 * This is necessary due to the fact that semantic version postfixes don't
 * really have any common format.
 * @param a The first semantic version string
 * @param b The second semantic version string
 * @returns 0 if the versions are equal, a negative number if a is less than b,
 *  and a positive number if a is greater than b.
 */
export function compareSemVer(a: string, b: string) {
  const semVerA = parseSemVer(a);
  const semVerB = parseSemVer(b);
  return (
    semVerA.major - semVerB.major ||
    semVerA.minor - semVerB.minor ||
    semVerA.patch - semVerB.patch
  );
}
