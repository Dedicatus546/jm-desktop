import { logErrorIpc, logInfoIpc } from "./apis";

const logger = {
  info(msg: string) {
    logInfoIpc(msg);
    if (import.meta.env.DEV) {
      console.log(msg);
    }
  },
  error(err: string) {
    logErrorIpc(err);
    if (import.meta.env.DEV) {
      console.error(err);
    }
  },
};

export default logger;
