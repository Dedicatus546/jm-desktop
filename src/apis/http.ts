import { xhrRequestAdapter } from "@alova/adapter-xhr";
import { createAlova } from "alova";
import vueHook from "alova/vue";

import { createLogger } from "@/logger";

import { trpcClient } from "./ipc";

const { info, error } = createLogger("api");

const ts = Math.floor(Date.now() / 1000);
const version = "1.8.0";
const token = "185Hcomic3PAPP7R";
const tokenHash = (await trpcClient.md5.query(`${ts}${token}`)).toLowerCase();

// const decode = (data: string) => {
//   return JSON.parse(
//     CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(tokenHash), {
//       mode: CryptoJS.mode.ECB,
//     }).toString(CryptoJS.enc.Utf8),
//   );
// };

let baseURL = "";
if (import.meta.env.DEV) {
  baseURL = "/api";
} else {
  const port = await trpcClient.getProxyServerPort.query();
  baseURL = `http://localhost:${port}/api`;
}

info("baseURL: ", baseURL);

const http = createAlova({
  statesHook: vueHook,
  requestAdapter: xhrRequestAdapter({}),
  baseURL,
  beforeRequest(method) {
    // method.config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    method.config.headers.tokenparam = `${ts},${version}`;
    method.config.headers.token = tokenHash;
  },
  responded: {
    async onSuccess(response, method) {
      if (response.status >= 400) {
        const errorMsg = response.data.errorMsg ?? response.statusText;
        error(method.url, response.status, errorMsg);
        throw new Error(errorMsg);
      }
      info(method.url, response.status);
      if (
        // 下载接口
        method.url.includes("dl_comic_zip") ||
        // jm 的阅读页是返回 html 填充的，必须解析 html 来获取相关数据
        method.url.includes("chapter_view_template")
      ) {
        return response.data;
      }
      const json = response.data;
      if (json.code !== 200) {
        throw new Error(json.errorMsg);
      }
      json.data = JSON.parse(
        await trpcClient.decodeHttpData.query({
          data: json.data,
          key: tokenHash,
        }),
      );
      info(method.url, "解密成功");
      return json;
    },
  },
});

export default http;
