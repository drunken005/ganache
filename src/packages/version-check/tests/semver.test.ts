// @ts-nocheck
process.env.VERSION_CHECK_CONFIG_NAME = "testConfig";
import { semverIsValid, semverUpgradeType } from "../src/semver";
import assert from "assert";

describe("semverUpgradeType", () => {
  const testVersion = "0.0.0";
  const version = "1.2.3";
  const alphaVersion = "1.2.3-alpha";
  const betaVersion = "1.2.3-beta";
  const invalidVersion = "notasemver";

  let message;

  beforeEach(() => {
    message = "";
  });

  describe("nulls", () => {
    it("handles null currentVersion", () => {
      assert(
        semverUpgradeType(null, "1.0.0") === null,
        true,
        "semverUpgradeType improperly handles null currentVersion"
      );
    });
    it("handles null latestVersion", () => {
      assert(
        semverUpgradeType("1.0.0", null) === null,
        true,
        "semverUpgradeType improperly handles null latestVersion"
      );
    });

    it("handles null versions", () => {
      assert(
        semverUpgradeType(null, null) === null,
        true,
        "semverUpgradeType improperly handles null versions"
      );
    });
  });
  describe("patches", () => {
    it("0.0.0 -> 0.0.1", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "0.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "patch",
        "0.0.0 -> 0.0.1 fails"
      );
    });
    it("0.0.1 -> 0.0.1", () => {
      const currentVersion = "0.0.1";
      const latestVersion = "0.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.0.1 -> 0.0.1 fails"
      );
    });
    it("0.0.2 -> 0.0.1", () => {
      const currentVersion = "0.0.2";
      const latestVersion = "0.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.0.2 -> 0.0.1 fails"
      );
    });
  });
  describe("minors", () => {
    it("0.0.0 -> 0.1.0", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "0.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "minor",
        "0.0.0 -> 0.1.0 fails"
      );
    });
    it("0.1.0 -> 0.1.0", () => {
      const currentVersion = "0.1.0";
      const latestVersion = "0.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.1.0 -> 0.1.0 fails"
      );
    });
    it("0.2.0 -> 0.1.0", () => {
      const currentVersion = "0.2.0";
      const latestVersion = "0.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.2.0 -> 0.1.0 fails"
      );
    });
  });
  describe("minors and patches", () => {
    it("0.0.0 -> 0.1.1", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "0.1.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "minor",
        "0.0.0 -> 0.1.1 fails"
      );
    });

    it("0.0.1 -> 0.1.1", () => {
      const currentVersion = "0.0.1";
      const latestVersion = "0.1.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "minor",
        "0.0.1 -> 0.1.1 fails"
      );
    });

    it("0.0.2 -> 0.1.1", () => {
      const currentVersion = "0.0.2";
      const latestVersion = "0.1.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "minor",
        "0.0.2 -> 0.1.1 fails"
      );
    });

    it("0.1.0 -> 0.1.1", () => {
      const currentVersion = "0.1.0";
      const latestVersion = "0.1.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "patch",
        "0.1.0 -> 0.1.1 fails"
      );
    });

    it("0.1.1 -> 0.1.1", () => {
      const currentVersion = "0.1.1";
      const latestVersion = "0.1.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.1.1 -> 0.1.1 fails"
      );
    });
    it("0.1.2 -> 0.1.1", () => {
      const currentVersion = "0.1.2";
      const latestVersion = "0.1.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.1.2 -> 0.1.1 fails"
      );
    });
    it("0.2.2 -> 0.1.1", () => {
      const currentVersion = "0.2.2";
      const latestVersion = "0.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.2.2 -> 0.1.1 fails"
      );
    });
    it("0.2.0 -> 0.1.1", () => {
      const currentVersion = "0.2.0";
      const latestVersion = "0.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.2.0 -> 0.1.1 fails"
      );
    });
    it("0.2.5 -> 0.1.1", () => {
      const currentVersion = "0.2.5";
      const latestVersion = "0.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "0.2.5 -> 0.1.1 fails"
      );
    });
  });
  describe("majors", () => {
    it("0.0.0 -> 1.0.0", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "1.0.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.0 -> 1.0.0 fails"
      );
    });
    it("1.0.0 -> 1.0.0", () => {
      const currentVersion = "1.0.0";
      const latestVersion = "1.0.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "1.0.0 -> 1.0.0 fails"
      );
    });
    it("2.0.0 -> 1.0.0", () => {
      const currentVersion = "2.0.0";
      const latestVersion = "1.0.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.0.0 -> 1.0.0 fails"
      );
    });
  });
  describe("majors and patches", () => {
    it("0.0.0 -> 1.0.1", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.0 -> 1.0.1 fails"
      );
    });
    it("0.0.1 -> 1.0.1", () => {
      const currentVersion = "0.0.1";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.1 -> 1.0.1 fails"
      );
    });
    it("0.0.2 -> 1.0.1", () => {
      const currentVersion = "0.0.2";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.2 -> 1.0.1 fails"
      );
    });

    it("1.0.0 -> 1.0.1", () => {
      const currentVersion = "1.0.0";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "patch",
        "1.0.0 -> 1.0.1 fails"
      );
    });

    it("1.0.1 -> 1.0.1", () => {
      const currentVersion = "1.0.1";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "1.0.1 -> 1.0.1 fails"
      );
    });
    it("1.0.2 -> 1.0.1", () => {
      const currentVersion = "1.0.2";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "1.0.2 -> 1.0.1 fails"
      );
    });
    it("2.0.2 -> 1.0.1", () => {
      const currentVersion = "2.0.2";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.0.2 -> 1.0.1 fails"
      );
    });
    it("2.0.0 -> 1.0.1", () => {
      const currentVersion = "2.0.0";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.0.0 -> 1.0.1 fails"
      );
    });
    it("2.0.5 -> 1.0.1", () => {
      const currentVersion = "2.0.5";
      const latestVersion = "1.0.1";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.0.5 -> 1.0.1 fails"
      );
    });
  });
  describe("majors and minors", () => {
    it("0.0.0 -> 1.1.0", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.0 -> 1.1.0 fails"
      );
    });

    it("0.1.0 -> 1.1.0", () => {
      const currentVersion = "0.1.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.1.0 -> 1.1.0 fails"
      );
    });

    it("0.2.0 -> 1.1.0", () => {
      const currentVersion = "0.2.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.2.0 -> 1.1.0 fails"
      );
    });

    it("1.0.0 -> 1.1.0", () => {
      const currentVersion = "1.0.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "minor",
        "1.0.0 -> 1.1.0 fails"
      );
    });

    it("1.1.0 -> 1.1.0", () => {
      const currentVersion = "1.1.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "1.1.0 -> 1.1.0 fails"
      );
    });
    it("1.2.0 -> 1.1.0", () => {
      const currentVersion = "1.2.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "1.2.0 -> 1.1.0 fails"
      );
    });
    it("2.2.0 -> 1.1.0", () => {
      const currentVersion = "2.2.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.2.0 -> 1.1.0 fails"
      );
    });
    it("2.0.0 -> 1.1.0", () => {
      const currentVersion = "2.0.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.0.0 -> 1.1.0 fails"
      );
    });
    it("2.5.0 -> 1.1.0", () => {
      const currentVersion = "2.5.0";
      const latestVersion = "1.1.0";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "2.5.0 -> 1.1.0 fails"
      );
    });
  });
  describe("majors and minors and patches", () => {
    it("0.0.0 -> 5.5.5", () => {
      const currentVersion = "0.0.0";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.0 -> 5.5.5 fails"
      );
    });
    it("5.5.5 -> 5.5.5", () => {
      const currentVersion = "5.5.5";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "5.5.5 -> 5.5.5 fails"
      );
    });
    it("5.5.6 -> 5.5.5", () => {
      const currentVersion = "5.5.6";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "5.5.6 -> 5.5.5 fails"
      );
    });
    it("5.6.5 -> 5.5.5", () => {
      const currentVersion = "5.5.5";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "5.6.5 -> 5.5.5 fails"
      );
    });
    it("5.6.6 -> 5.5.5", () => {
      const currentVersion = "5.6.6";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "5.6.6 -> 5.5.5 fails"
      );
    });
    it("6.5.5 -> 5.5.5", () => {
      const currentVersion = "6.5.5";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "6.5.5 -> 5.5.5 fails"
      );
    });
    it("6.5.6 -> 5.5.5", () => {
      const currentVersion = "6.5.6";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "6.5.6 -> 5.5.5 fails"
      );
    });
    it("6.6.6 -> 5.5.5", () => {
      const currentVersion = "6.6.6";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "6.6.6 -> 5.5.5 fails"
      );
    });
    it("0.0.6 -> 5.5.5", () => {
      const currentVersion = "0.0.6";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.0.6 -> 5.5.5 fails"
      );
    });
    it("0.6.0 -> 5.5.5", () => {
      const currentVersion = "0.6.0";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        "major",
        "0.6.0 -> 5.5.5 fails"
      );
    });
    it("6.0.0 -> 5.5.5", () => {
      const currentVersion = "6.0.0";
      const latestVersion = "5.5.5";

      assert.equal(
        semverUpgradeType(currentVersion, latestVersion),
        null,
        "6.0.0 -> 5.5.5 fails"
      );
    });
  });
  describe("alphas and betas", () => {
    it("1.2.2 -> 1.2.3-alpha", () => {
      assert.equal(semverUpgradeType("1.2.2", alphaVersion), "prepatch");
    });
    it("1.2.2 -> 1.2.3-beta", () => {
      assert.equal(semverUpgradeType("1.2.2", betaVersion), "prepatch");
    });
    it("alpha -> release", () => {
      assert.equal(semverUpgradeType(alphaVersion, version), "prerelease");
    });
    it("beta -> alpha", () => {
      assert.equal(semverUpgradeType(alphaVersion, version), "prerelease");
    });
    it("beta -> release", () => {
      assert.equal(semverUpgradeType(alphaVersion, version), "prerelease");
    });
    it("1.2.4 -> 1.2.3-alpha", () => {
      assert.equal(semverUpgradeType("1.2.4", alphaVersion), null);
    });
  });
  describe("version strings", () => {
    it("v0.0.1 -> v0.0.2", () => {
      assert.equal(semverUpgradeType("v0.0.1", "v0.0.2"), "patch");
    });
    it("v0.0.1 -> 0.0.2", () => {
      assert.equal(semverUpgradeType("v0.0.1", "0.0.2"), "patch");
    });
    it("v0.1.0 -> v0.2.0", () => {
      assert.equal(semverUpgradeType("v0.1.0", "v0.2.0"), "minor");
    });
    it("v0.1.0 -> 0.2.0", () => {
      assert.equal(semverUpgradeType("v0.1.0", "0.2.0"), "minor");
    });
    it("v0.0.1-alpha -> v0.0.2", () => {
      assert.equal(semverUpgradeType("v0.0.1-alpha", "v0.0.2"), "prepatch");
    });
    it("v0.0.2 -> v0.0.2-alpha", () => {
      assert.equal(semverUpgradeType("v0.0.2", "v0.0.2-alpha"), null);
    });
  });
  describe("semverIsValid", () => {
    it("returns semver if valid", () => {
      assert.equal(semverIsValid(testVersion), testVersion);
    });
    it("returns null if invalid semver", () => {
      assert.equal(semverIsValid(invalidVersion), null);
    });
  });
});
