import { exposeElectronTRPC } from "trpc-electron-fork/main";

process.once("loaded", () => {
  exposeElectronTRPC();
});
