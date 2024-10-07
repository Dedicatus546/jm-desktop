export const logger = {
  info(msg: string) {
    ipcRenderer.infoLog(`[renderer] ${msg}`);
  },
  error(err: string) {
    ipcRenderer.errorLog(`[renderer] ${err}`);
  },
};
