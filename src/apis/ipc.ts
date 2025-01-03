import { BaseComic, Config } from "@/types/base";

const invoke = <T>(name: string, ...args: any) => {
  return ipcRenderer.invoke(name, ...args) as Promise<T>;
};

export const minimizeWinIpc = () => {
  return ipcRenderer.send("app/minimizeWin");
};

export const closeWinIpc = () => {
  return ipcRenderer.send("app/closeWin");
};

export const openLinkIpc = (link: string) => {
  return ipcRenderer.send("app/openLink", link);
};

export const showItemInFolder = (path: string) => {
  return ipcRenderer.send("app/showItemInFolder", path);
};

export const relaunchAppIpc = () => {
  return ipcRenderer.send("app/relaunch");
};

const logIpc = (level: "info" | "error", msg: string) => {
  return ipcRenderer.send(`logger/${level}`, msg);
};

export const logInfoIpc = (msg: string) => {
  return logIpc("info", msg);
};

export const logErrorIpc = (err: string) => {
  return logIpc("error", err);
};

export const getDownloadComicListIpc = (query: {
  page: number;
  pageSize: number;
}) => {
  return invoke<{
    list: Array<
      BaseComic & {
        fileName: string;
        belongId: number;
        seriesName: string;
      }
    >;
    total: number;
  }>("app/getDownloadList", query.page, query.pageSize);
};

export const insertDownloadComicIpc = (query: {
  id: number;
  belongId: number;
  name: string;
  seriesName: string;
  fileName: string;
  author: string;
}) => {
  return ipcRenderer.invoke("app/insertDownload", query) as Promise<boolean>;
};

export const saveDownloadComicIpc = (buffer: ArrayBuffer, name: string) => {
  return invoke<void>("app/saveDownloadFile", buffer, name);
};

export const updateConfigIpc = (config: Partial<Config>) => {
  return invoke<void>("app/updateConfig", config);
};

export const getConfigIpc = () => {
  return invoke<Config>("app/config");
};

export const selectFolderIpc = () => {
  return invoke<string>("app/selectFolder");
};
