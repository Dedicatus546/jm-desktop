import { dialog, shell } from "electron";
import { z } from "zod";

import { trpc } from "./trpc";

const minimizeWinRpc = trpc.procedure.query(({ ctx }) => {
  const win = ctx.win;
  win.minimize();
});

const closeWinRpc = trpc.procedure.query(({ ctx }) => {
  const win = ctx.win;
  win.close();
});

const openLinkRpc = trpc.procedure
  .input(
    z.object({
      url: z.string(),
    }),
  )
  .query(({ input }) => {
    shell.openExternal(input.url);
  });

const showItemInFolderRpc = trpc.procedure
  .input(
    z.object({
      path: z.string(),
    }),
  )
  .query(({ input }) => {
    shell.showItemInFolder(input.path);
  });

const selectFolderRpc = trpc.procedure.query(async ({ ctx }) => {
  const { win } = ctx;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

export const router = {
  minimizeWin: minimizeWinRpc,
  closeWin: closeWinRpc,
  openLink: openLinkRpc,
  showItemInFolder: showItemInFolderRpc,
  selectFolder: selectFolderRpc,
};
