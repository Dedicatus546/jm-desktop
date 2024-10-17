import { xhrRequestAdapter } from "@alova/adapter-xhr";
import { createAlova } from "alova";
import vueHook from "alova/vue";
import CryptoJS from "crypto-js";

const ts = Math.floor(Date.now() / 1000);
const version = "1.7.4";
const token = "185Hcomic3PAPP7R";
const tokenHash = CryptoJS.MD5(`${ts}${token}`).toString().toLowerCase();

const decode = (data: string) => {
  return JSON.parse(
    CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(tokenHash), {
      mode: CryptoJS.mode.ECB,
    }).toString(CryptoJS.enc.Utf8),
  );
};

const http = createAlova({
  statesHook: vueHook,
  requestAdapter: xhrRequestAdapter(),
  baseURL: "/api",
  beforeRequest(method) {
    // method.config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    method.config.headers.tokenparam = `${ts},${version}`;
    method.config.headers.token = tokenHash;
  },
  responded: {
    async onSuccess(response, method) {
      if (response.status >= 400) {
        throw new Error(response.data.errorMsg ?? response.statusText);
      }
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
      json.data = decode(json.data);
      console.log(method.url, response.status, json);
      return json;
    },
  },
});

export default http;
