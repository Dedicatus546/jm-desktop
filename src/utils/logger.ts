export const logger = {
  info(msg: string) {
    ipcRenderer.send("logger/info", `[renderer] ${msg}`);
  },
  error(err: string) {
    ipcRenderer.send("logger/error", `[renderer] ${err}`);
  },
};
