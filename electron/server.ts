import { Server } from "node:http";
import { AddressInfo } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import Express, { Express as ExpressServer } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

let app: ExpressServer | null = null;
let server: Server | null = null;

export const createServer = async (config: { target?: string } = {}) => {
  return new Promise<{ port: number }>((resolve, reject) => {
    const mergeConfig = Object.assign(
      {
        target: "https://www.jmeadpoolcdn.life",
      },
      config,
    );
    if (app !== null && server !== null) {
      app = null;
      server.close();
    }

    app = Express();
    app.use(cors());
    app.use("/", Express.static(RENDERER_DIST));

    app.use(
      "/api",
      createProxyMiddleware({
        target: mergeConfig.target,
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          "^/api": "",
        },
      }),
    );

    app.get("*", (_req, res) => {
      res.sendFile(path.join(RENDERER_DIST, "index.html"));
    });

    server = app.listen(0, () => {
      const port = (server!.address() as AddressInfo).port;
      console.log("start server, port:", port);
      resolve({ port });
    });

    server.on("error", (err) => {
      reject(err);
    });
  });
};

export const closeServer = () => {
  app = null;
  server?.close();
  console.log("close server");
};
