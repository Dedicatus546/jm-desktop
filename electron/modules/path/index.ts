import { dirname, join } from "node:path";

import { singleton } from "tsyringe";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@singleton()
export class PathService {
  private appRoot: string;
  private devServerUrl: string;
  private distElectron: string;
  private distRenderer: string;
  private public: string;

  constructor() {
    this.appRoot = join(__dirname, "..");
    this.devServerUrl = process.env["VITE_DEV_SERVER_URL"]!;
    this.distElectron = join(this.appRoot, "dist-electron");
    this.distRenderer = join(this.appRoot, "dist");
    this.public = import.meta.env.DEV
      ? join(this.appRoot, "public")
      : this.distRenderer;
  }

  getAppRootPath() {
    return this.appRoot;
  }

  getDevServerUrl() {
    return this.devServerUrl;
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
}
