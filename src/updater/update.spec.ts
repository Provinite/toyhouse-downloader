import pkg from "../../package.json";
describe("updater", () => {
  describe("package.json assumptions", () => {
    it("should have a semver version", () => {
      expect(pkg.version).toBeDefined();
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+(-.*)?$/);
    });

    it("should have a repository", () => {
      expect(pkg.repository).toBeDefined();
      expect(pkg.repository).toMatch(/^github:[^/]+\/[^/]+$/);
    });
  });
});
