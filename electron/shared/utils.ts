import { ProxyInfo } from "@electron/module/config";

export const resolveProxyUrl = (proxyInfo?: ProxyInfo) => {
  if (!proxyInfo) {
    return undefined;
  }
  const { host, port, username, password } = proxyInfo;
  const url = new URL(`http://${host}:${port}`);
  url.username = username;
  url.password = password;
  // 去除末尾斜杠
  return url.toString().slice(0, -1);
};
