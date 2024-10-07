import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  minimizeWin() {
    ipcRenderer.send("minimizeWin");
  },
  closeWin() {
    ipcRenderer.send("closeWin");
  },
  infoLog(msg: string) {
    ipcRenderer.send("logger/info", msg);
  },
  errorLog(err: string) {
    ipcRenderer.send("logger/error", err);
  },
  async getConfig() {
    return ipcRenderer.invoke("app/config") as Promise<{
      url: string;
      downloadDir: string;
    }>;
  },
  async updateConfig(updatedConfig: any) {
    return ipcRenderer.invoke("app/updateConfig", updatedConfig);
  },
  async selectFolder() {
    return ipcRenderer.invoke("app/selectFolder");
  },
  async isDownload(comicId: number) {
    return ipcRenderer.invoke("app/isDownload", comicId);
  },
  async getDonwloadList(page: number, pageSize: number) {
    return ipcRenderer.invoke("app/getDownloadList", page, pageSize);
  },
  async insertDownload(args: { id: number; name: string; author: string }) {
    return ipcRenderer.invoke("app/insertDownload", args);
  },
  async saveDownloadFile(file: File) {
    return ipcRenderer.invoke(
      "app/saveDownloadFile",
      await file.arrayBuffer(),
      file.name,
    );
  },
});
