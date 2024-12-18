import { Agent, Server } from "node:http";
import { AddressInfo } from "node:net";
import { join } from "node:path";

import cors from "cors";
import Express, { Express as ExpressServer } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { HttpsProxyAgent } from "https-proxy-agent";
import { inject, singleton } from "tsyringe";

import { ConfigService } from "../config";
import { LoggerService } from "../logger";
import { PathService } from "../path";

@singleton()
export class ProxyServerService {
  // @ts-expect-error express instance
  private app: ExpressServer | null = null;
  private server: Server | null = null;
  private serverInitPromise: Promise<void> | null = null;

  static DEFAULT_CONFIG = {
    target: "https://www.jmapiproxyxxx.vip",
  };

  constructor(
    @inject(ConfigService) private configService: ConfigService,
    @inject(LoggerService) private loggerService: LoggerService,
    @inject(PathService) private pathService: PathService,
  ) {
    this.createServer();
  }

  private createServer() {
    const config = Object.assign({}, ProxyServerService.DEFAULT_CONFIG, {
      target: this.configService.get().apiUrl,
    });
    let agent: Agent | undefined = undefined;
    const proxyUrl = this.configService.resolveProxyUrl();
    if (proxyUrl) {
      agent = new HttpsProxyAgent(proxyUrl);
      this.loggerService.info(`接口使用 http 代理`);
    } else {
      this.loggerService.info(`接口未配置 http 代理`);
    }
    this.loggerService.info(`默认代理服务器配置 ${JSON.stringify(config)}`);

    const app = (this.app = Express());
    app.use(cors());
    app.use("/", Express.static(this.pathService.getDistRendererPath()));

    app.use(
      "/api",
      createProxyMiddleware({
        target: config.target,
        agent,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          "^/api": "",
        },
      }),
    );

    // vue 路由
    app.get("*", (_req, res) => {
      res.sendFile(join(this.pathService.getDistRendererPath(), "index.html"));
    });

    this.serverInitPromise = new Promise((resolve, reject) => {
      const devServerUrl = process.env["VITE_DEV_SERVER_URL"];
      const port = devServerUrl ? 6174 : 0;
      this.server = app.listen(port, () => {
        this.loggerService.info(
          `启动代理服务器，随机端口为 ${(this.server!.address() as AddressInfo).port}`,
        );
        resolve();
      });

      this.server.on("error", (err) => {
        this.loggerService.error(`启动代理服务器失败，原因 ${String(err)}`);
        reject();
      });
    });
  }

  public async getPort() {
    if (!this.server) {
      this.loggerService.error(`无法获取代理服务器端口，代理服务器未启动`);
      return;
    }
    await this.serverInitPromise;
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
