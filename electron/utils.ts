import { dirname } from "node:path";

import { app } from "electron";

export const appDir = import.meta.env.DEV
  ? app.getAppPath()
  : dirname(app.getPath("exe"));
