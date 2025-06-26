import {
  Config,
  getConfig,
  ProxyInfo,
  saveConfig,
} from "@electron/module/config";
import { restartExpressServer } from "@electron/module/express-server";
import { emitter } from "@electron/shared/mitt";
import { z } from "zod";

import { trpc } from "./trpc";

const shouldRestartProxyServer = (
  newProxyInfo?: ProxyInfo,
  oldProxyInfo?: ProxyInfo,
) => {
  if (!oldProxyInfo && !newProxyInfo) {
    return false;
  }
  if ((!oldProxyInfo && newProxyInfo) || (oldProxyInfo && !newProxyInfo)) {
    return true;
  }
  if (
    oldProxyInfo?.host === newProxyInfo?.host &&
    oldProxyInfo?.port === newProxyInfo?.port &&
    oldProxyInfo?.username === newProxyInfo?.username &&
    oldProxyInfo?.password === newProxyInfo?.password
  ) {
    return false;
  }
  return true;
};

const getConfigRpc = trpc.procedure.query(async () => {
  return getConfig();
});

const saveConfigRpc = trpc.procedure
  .input(
    z.object({
      theme: z.enum(["light", "dark", "auto"]),
      apiUrl: z.string(),
      apiUrlList: z.array(z.string()),
      readMode: z.enum(["scroll", "click"]),
      autoLogin: z.boolean(),
      loginUserInfo: z.string(),
      zoomFactor: z.number(),
      windowInfo: z
        .object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        })
        .optional(),
      proxyInfo: z
        .object({
          host: z.string(),
          port: z.number(),
          username: z.string(),
          password: z.string(),
        })
        .optional(),
    }) satisfies z.ZodType<Config>,
  )
  .query(async ({ input: newConfig }) => {
    const config = await getConfig();
    await saveConfig(newConfig);
    if (shouldRestartProxyServer(newConfig.proxyInfo, config.proxyInfo)) {
      await restartExpressServer();
      emitter.emit("onProxyInfoChange");
    }
  });

export const router = {
  getConfig: getConfigRpc,
  saveConfig: saveConfigRpc,
};
