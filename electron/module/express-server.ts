import { createHash } from "node:crypto";
import { Agent, Server } from "node:http";
import { AddressInfo } from "node:net";
import { join } from "node:path";

import { distElectron, distRenderer } from "@electron/shared/path";
import { resolveProxyUrl } from "@electron/shared/utils";
import cors from "cors";
import { format } from "date-fns";
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
  let agent: Agent | undefined;
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

  express.get("/api/getLightNovelTxtContent", async (req, res) => {
    const q = req.query.q as string;
    const forceGet = req.query.forceGet as string;
    const encoding = (req.query.encoding as string) ?? "utf-8";
    // 在 chrome 下正常，但是 electron 下就不正常，离谱。。
    // TODO 这里很奇怪，设置 304 还是返回 200
    // 但是确实走了缓存
    try {
      if (!forceGet && req.headers["if-none-match"]) {
        res.set({
          "Cache-Control": "max-age=2592000, no-cache",
          ETag: `"${req.headers["if-none-match"]}"`,
          "Last-Modified": req.headers["if-modified-since"],
          "return-cache": "true",
        });
        res.status(304).end();
        return;
      }
      const buffer = await fetch(q, {
        method: "GET",
      }).then((res) => res.arrayBuffer());
      const td = new TextDecoder(encoding);
      const resStr = td.decode(buffer);
      const md5 = createHash("md5")
        .update(resStr)
        .digest()
        .toString("hex")
        .toLowerCase();
      res.set({
        "Cache-Control": "max-age=2592000, no-cache",
        ETag: `"${md5}"`,
        "Last-Modified": new Date().toUTCString(),
      });
      res.type("application/json");
      res.end(
        JSON.stringify({
          code: 200,
          message: "",
          results: resStr,
        }),
      );
    } catch (e) {
      res.send(e);
    }
  });

  info("设置 api 转发");
  express.use(
    "/api",
    (req, _res, next) => {
      req.headers["user-agent"] = "COPY/2.3.0";
      req.headers.source = "copyApp";
      // mumu 模拟器设备
      req.headers.deviceinfo = "2206123SC-mayfly";
      req.headers.device = "V417IR";
      req.headers.webp = "1";
      req.headers.platform = "3";
      req.headers.dt = format(new Date(), "yyyy.MM.dd");
      req.headers.referer = "com.copymanga.app-2.3.0";
      req.headers.region = "1";
      req.headers.version = "2.3.0";
      req.headers.umstring = "b4c89ca4104ea9a97750314d791520ac";
      next();
    },
    (info("创建 api 转发中间件"),
    createProxyMiddleware({
      target: config.apiUrl,
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
