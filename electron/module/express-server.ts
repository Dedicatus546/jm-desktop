import { Server } from "node:http";
import { AddressInfo } from "node:net";
import { join } from "node:path";

import { distElectron, distRenderer } from "@electron/shared/path";
import { resolveProxyUrl } from "@electron/shared/utils";
import cors from "cors";
import Express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { HttpsProxyAgent } from "https-proxy-agent";

import { getConfig } from "./config";
import { createLogger } from "./logger";

const { info, error, warn } = createLogger("express-server");

let expressServer: Server | undefined;
let expressServerInitPromise: Promise<void> | undefined;

export const getExpressServerPort = async () => {
  if (!expressServer) {
    warn("没有获取到 server 实例，无法获取端口");
    return;
  }
  await expressServerInitPromise;
  const address = expressServer.address() as AddressInfo;
  return address.port;
};

export const closeExpressServer = async () => {
  return new Promise<void>((resolve, reject) => {
    expressServer?.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      expressServer = undefined;
      expressServerInitPromise = undefined;
      resolve();
    });
  });
};

const getExpressInstance = async () => {
  info("读取配置");
  const config = await getConfig();

  info("读取代理信息");
  let agent: HttpsProxyAgent<string> | undefined;
  const proxyUrl = resolveProxyUrl(config.proxyInfo);
  if (proxyUrl) {
    info("代理已配置，地址为：%s", proxyUrl);
    agent = new HttpsProxyAgent(proxyUrl);
  } else {
    info("代理未配置");
  }

  const express = Express();
  express.use(
    cors({
      // https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Access-Control-Max-Age
      // 结果可被缓存的最大秒数，以无符号非负整数表示。Firefox 上限为 24 小时（86400 秒）。Chromium（76 版本之前）上限为 10 分钟（600 秒）
      // Chromium（从 76 版本开始）上限为 2 小时（7200 秒）。默认值为 5 秒。
      // 缓存 2 小时，防止频繁发送预检请求
      maxAge: 60 * 60 * 2,
    }),
  );
  info("设置 distRenderer：%s 为静态目录", distRenderer);
  express.use("/", Express.static(distRenderer));

  info("设置 api 转发");
  express.use(
    "/api",
    (info("创建 api 转发中间件"),
    createProxyMiddleware({
      target: (info("api 目标地址：%s", config.apiUrl), config.apiUrl),
      agent,
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        "^/api": "",
      },
    })),
  );

  // vue 路由
  const filepath = join(distElectron, "index.html");
  info("设置剩余路由跳转 index.html ，路径为 %s", filepath);
  express.get("/:rest", (_req, res) => {
    res.sendFile(filepath);
  });

  return express;
};

export const startExpressServer = async () => {
  info("启动 server");
  info("获取 express 实例");
  const express = await getExpressInstance();
  await (expressServerInitPromise = new Promise<void>((resolve, reject) => {
    const devServerUrl = process.env["VITE_DEV_SERVER_URL"];
    const port = devServerUrl ? 6174 : 0;
    expressServer = express.listen(port, async () => {
      info("server 启动成功");
      resolve();
    });
    expressServer.on("error", (err) => {
      error("server 错误，原因：%s", String(err));
      reject(err);
    });
  }));

  const port = await getExpressServerPort();
  info("server 端口为 %d", port);
};

export const restartExpressServer = async () => {
  info("开始重启 server");
  if (expressServer) {
    info("关闭原 server");
    await closeExpressServer();
  }
  info("重新启动 server");
  info("获取 express 实例");
  const express = await getExpressInstance();
  await (expressServerInitPromise = new Promise<void>((resolve, reject) => {
    const devServerUrl = process.env["VITE_DEV_SERVER_URL"];
    const port = devServerUrl
      ? (info("server 端口为 6174"), 6174)
      : (info("server 端口随机"), 0);
    expressServer = express.listen(port, async () => {
      info("server 启动成功");
      resolve();
    });
    expressServer.on("error", (err) => {
      error("server 错误，原因：%s", String(err));
      reject(err);
    });
  }));
  const port = await getExpressServerPort();
  info("server 端口为 %d", port);
};

startExpressServer();
