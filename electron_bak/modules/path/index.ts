import { dirname, join } from "node:path";

import { app } from "electron";
import { singleton } from "tsyringe";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@singleton()
export class PathService {
  private appRoot: string;
  private distElectron: string;
  private distRenderer: string;
  private public: string;
  private dataDir: string;

  constructor() {
    this.appRoot = join(__dirname, "..");
    this.distElectron = join(this.appRoot, "dist-electron");
    this.distRenderer = join(this.appRoot, "dist");
    this.public = import.meta.env.DEV
      ? join(this.appRoot, "public")
      : this.distRenderer;
    this.dataDir = join(
      ...(import.meta.env.DEV
        ? [this.appRoot, "data"]
        : [app.getPath("exe"), "..", "data"]),
    );
  }

  getAppRootPath() {
    return this.appRoot;
  }

  getDistElectronPath() {
    return this.distElectron;
  }

  getDistRendererPath() {
    return this.distRenderer;
  }

  getPublicPath() {
    return this.public;
  }

  getDataDirPath() {
    return this.dataDir;
  }
}
