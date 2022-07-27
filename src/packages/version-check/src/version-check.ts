import { TruffleColors } from "@ganache/colors";
import http2 from "http2";
import Conf from "conf";
import { Logger } from "@ganache/ethereum-options";
import { isValidSemver, semverUpgradeType } from "./semver";
import { detectCI } from "./ci";

export type VersionCheckConfig = {
  packageName: string;
  enabled: boolean;
  url: string;
  ttl: number;
  latestVersion: string;
  latestVersionLogged: string;
  disableInCI: boolean;
};

export type ConfigManager = {
  get: Function;
  set: Function;
  path: string;
};

type BannerMessageOptions = {
  upgradeType: string;
  packageName: string;
  currentVersion: string;
  latestVersion: string;
};

type VersionCheckStatus = "disabled" | "idle" | "fetching" | "destroyed";

export class VersionCheck {
  private ConfigManager: ConfigManager;
  private _config: VersionCheckConfig;
  private _logger: Logger;
  private _currentVersion: string;

  private _session: http2.ClientHttp2Session;
  private _request: http2.ClientHttp2Stream;

  constructor(
    currentVersion: string,
    config?: VersionCheckConfig,
    logger?: Logger
  ) {
    this.ConfigManager = new Conf({
      configName: process.env.VERSION_CHECK_CONFIG_NAME
        ? process.env.VERSION_CHECK_CONFIG_NAME
        : "config" // config is the package default
    });

    this._config = {
      ...VersionCheck.DEFAULTS,
      ...this.ConfigManager.get(),
      ...config
    };

    if (config) this.saveConfig();

    const version = isValidSemver(currentVersion);

    if (version) {
      this._currentVersion = version;
    } else {
      this.setEnabled(false);
    }

    if (this._config.disableInCI) {
      if (detectCI()) {
        this.setEnabled(false);
      }
    }

    this._logger = logger || console;
  }

  init() {
    this.getLatestVersion();
    return this;
  }

  destroy() {
    if (this._request) {
      this._request.close();
    }

    if (this._session) {
      this._session.close();
    }

    this._request = null;
    this._session = null;
  }

  setEnabled(enabled: boolean) {
    this.set("enabled", enabled);
  }

  setLatestVersion(latestVersion: string) {
    this.set("latestVersion", latestVersion);
  }

  setLatestVersionLogged(latestVersionLogged: string) {
    this.set("latestVersionLogged", latestVersionLogged);
  }

  setPackageName(packageName: string) {
    this.set("packageName", packageName);
  }

  setTTL(ttl: number) {
    this.set("ttl", ttl);
  }

  setUrl(url: string) {
    this.set("url", url);
  }

  private set(key: string, value: string | number | boolean) {
    this._config[key] = value;
    this.saveConfig();
  }

  private saveConfig() {
    this.ConfigManager.set(this._config);
  }

  configFileLocation() {
    return this.ConfigManager.path;
  }

  alreadyLoggedVersion() {
    return !semverUpgradeType(
      this._config.latestVersionLogged,
      this._config.latestVersion
    );
  }

  canNotifyUser() {
    if (!this._currentVersion) {
      return false;
    } else if (!this._config.enabled) {
      return false;
    } else if (this.alreadyLoggedVersion()) {
      return false;
    }

    return true;
  }

  async getLatestVersion() {
    if (!this._config.enabled) return false;
    try {
      this.setLatestVersion(await this.fetchLatest());
    } catch {}
  }

  private fetchLatest() {
    const { packageName, url, ttl } = this._config;

    return new Promise<string>((resolve, reject) => {
      const session = http2.connect(url);
      const req = session.request({ ":path": `/?name=${packageName}` });

      this._session = session;
      this._request = req;

      session.on("error", err => reject(err));
      req.setEncoding("utf8");

      req
        .on("error", reject)
        .on("response", (headers, flags) => {
          let data = "";
          req
            .on("data", chunk => {
              data += chunk;
            })
            .on("end", async () => {
              resolve(data);
              session.close();
            });
        })
        .setTimeout(ttl, () => {
          req.close();
          session.close();
          reject(`ttl expired: ${ttl}`);
        });
      req.end();
    });
  }

  log() {
    if (!this.canNotifyUser()) return false;

    const currentVersion = this._currentVersion;
    const { packageName, latestVersion } = this._config;

    const upgradeType = semverUpgradeType(currentVersion, latestVersion);

    this.logBannerMessage({
      upgradeType,
      packageName,
      currentVersion,
      latestVersion
    });
    this.setLatestVersionLogged(latestVersion);
    return true;
  }

  private logBannerMessage(options: BannerMessageOptions) {
    const { upgradeType, packageName, currentVersion, latestVersion } = options;

    const chalk = require("chalk");

    const reAnsiEscapes =
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
    const WRAP_WIDTH = Math.min(120, process.stdout.columns || 0);
    const center = (str: string, width: number) => {
      const mid = (width - visibleCharacterLength(str)) / 2;
      if (mid < 0) return str;

      const left = Math.floor(mid);
      const right = Math.ceil(mid);
      return " ".repeat(left) + str + " ".repeat(right);
    };
    const visibleCharacterLength = (str: string) => {
      // if the string contains unicode characters we need to count them,
      // destructuring the string to get the characters as codePoints
      return [...str.replace(reAnsiEscapes, "")].length;
    };

    const line1 = chalk`New {hex("${TruffleColors.porsche}") ${upgradeType}} version of ${packageName} available! {hex("${TruffleColors.watermelon}") ${currentVersion}} ⇢ {hex("${TruffleColors.green}") ${latestVersion}} `;
    const line2 = chalk`{hex("${TruffleColors.porsche}") Changelog:} {hex("${TruffleColors.turquoise}") https://github.com/trufflesuite/${packageName}/releases/v${latestVersion}}`;
    const line3 = chalk`Run {hex("${TruffleColors.green}") npm install -g ${packageName}@${latestVersion}} to update!`;
    const width =
      Math.max(
        visibleCharacterLength(line1),
        visibleCharacterLength(line2),
        visibleCharacterLength(line3)
      ) + 4;
    const wrapWidth = Math.max(width, WRAP_WIDTH);
    const vPipe = chalk`{hex("${TruffleColors.yellow}") ║}`;
    const hLines = "═".repeat(width);
    const emptyLine = center(
      vPipe + " ".repeat(width) + vPipe,
      Math.max(width, wrapWidth)
    );
    const message = [""];
    message.push(
      chalk`{hex("${TruffleColors.yellow}") ${center(
        "╔" + hLines + "╗",
        wrapWidth
      )}}`
    );
    message.push(emptyLine);
    message.push(center(vPipe + center(line1, width) + vPipe, wrapWidth));
    message.push(center(vPipe + center(line2, width) + vPipe, wrapWidth));
    message.push(center(vPipe + center(line3, width) + vPipe, wrapWidth));
    message.push(emptyLine);
    message.push(
      chalk`{hex("${TruffleColors.yellow}") ${center(
        "╚" + hLines + "╝",
        wrapWidth
      )}}`
    );
    message.push("");
    this._logger.log(message.join("\n"));
    return true;
  }

  // This is called with --version and is displayed each time
  getVersionMessage() {
    const currentVersion = this._currentVersion;
    const { latestVersion } = this._config;
    if (semverUpgradeType(currentVersion, latestVersion)) {
      return `note: there is a new version available! ${currentVersion} -> ${latestVersion}`;
    }
    return "";
  }

  static get DEFAULTS(): VersionCheckConfig {
    return {
      packageName: "ganache",
      enabled: false,
      url: "https://version.trufflesuite.com",
      ttl: 2000, // http2session.setTimeout
      latestVersion: "0.0.0", // Last version fetched from the server
      latestVersionLogged: "0.0.0", // Last version to tell the user about
      disableInCI: true
    };
  }
}
