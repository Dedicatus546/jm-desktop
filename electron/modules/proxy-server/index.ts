import { Server } from "node:http";
import { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import Express, { Express as ExpressServer } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { inject, singleton } from "tsyringe";

import { ConfigService } from "../config";
import { LoggerService } from "../logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@singleton()
export class ProxyServerService {
  private app: ExpressServer | null = null;
  private server: Server | null = null;

  static DEFAULT_CONFIG = {
    target: "https://www.jmeadpoolcdn.life",
  };

  constructor(
    @inject(ConfigService) private configService: ConfigService,
    @inject(LoggerService) private loggerService: LoggerService,
  ) {
    this.createServer();
  }

  private createServer() {
    const appRootPath = join(__dirname, "..");
    const RENDERER_DIST = join(appRootPath, "dist");

    const config = Object.assign({}, ProxyServerService.DEFAULT_CONFIG, {
      target: this.configService.get().apiUrl,
    });

    const app = (this.app = Express());
    app.use(cors());
    app.use("/", Express.static(RENDERER_DIST));

    app.use(
      "/api",
      createProxyMiddleware({
        target: config.target,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          "^/api": "",
        },
      }),
    );

    // vue 路由
    app.get("*", (_req, res) => {
      res.sendFile(join(RENDERER_DIST, "index.html"));
    });

    this.server = app.listen(0, () => {
      this.loggerService.info("启动代理服务器");
    });

    this.server.on("error", (err) => {
      this.loggerService.error(`启动代理服务器失败 ${String(err)}`);
    });
  }

  public getPort() {
    if (!this.server) {
      this.loggerService.error(`无法获取代理服务器端口，代理服务器未启动`);
      return;
    }
    const address = this.server.address() as AddressInfo;
    return address.port;
  }

  public closeServer() {
    this.app = null;
    this.server?.close();
    this.server = null;
    this.loggerService.info(`关闭代理服务器`);
  }
}
