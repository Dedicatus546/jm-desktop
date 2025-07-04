import { createCipheriv, createDecipheriv, createHash } from "node:crypto";

import { dialog, shell } from "electron";
import { z } from "zod";

import { trpc } from "./trpc";

const minimizeWinRpc = trpc.procedure.mutation(({ ctx }) => {
  const win = ctx.win;
  win.minimize();
});

const closeWinRpc = trpc.procedure.mutation(({ ctx }) => {
  const win = ctx.win;
  win.close();
});

const openLinkRpc = trpc.procedure
  .input(
    z.object({
      url: z.string(),
    }),
  )
  .mutation(({ input }) => {
    shell.openExternal(input.url);
  });

const showItemInFolderRpc = trpc.procedure
  .input(
    z.object({
      path: z.string(),
    }),
  )
  .mutation(({ input }) => {
    shell.showItemInFolder(input.path);
  });

const selectFolderRpc = trpc.procedure.mutation(async ({ ctx }) => {
  const { win } = ctx;
  const result = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

const md5Rpc = trpc.procedure.input(z.string()).query(async ({ input }) => {
  return createHash("md5").update(input).digest("hex");
});

const decodeHttpDataRpc = trpc.procedure
  .input(
    z.object({
      data: z.string(),
      key: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { data, key } = input;
    const decipher = createDecipheriv(
      "aes-256-ecb",
      Buffer.from(key, "utf-8"),
      null,
    );
    let result = decipher.update(data, "base64", "utf8");
    result += decipher.final("utf8");
    decipher.destroy();
    return result;
  });

// 32 位
const key = Buffer.from(
  createHash("sha256").update("cm-desktop-key").digest("hex").slice(0, 32),
  "utf-8",
);

// 16位
const iv = Buffer.from(
  createHash("sha256").update("cm-desktop-iv").digest("hex").slice(0, 16),
  "utf-8",
);

const encryptLoginUserRpc = trpc.procedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { username, password } = input;
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    let result = cipher.update(
      JSON.stringify({
        username,
        password,
      }),
      "utf-8",
      "base64",
    );
    result += cipher.final("base64");

    return result;
  });

export const decryptLoginUserRpc = trpc.procedure
  .input(z.string())
  .query(async ({ input }) => {
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    let result = decipher.update(input, "base64", "utf-8");
    result += decipher.final("utf-8");
    return JSON.parse(result) as { username: string; password: string };
  });

export const router = {
  minimizeWin: minimizeWinRpc,
  closeWin: closeWinRpc,
  openLink: openLinkRpc,
  showItemInFolder: showItemInFolderRpc,
  selectFolder: selectFolderRpc,
  md5: md5Rpc,
  decodeHttpData: decodeHttpDataRpc,
  encryptLoginUser: encryptLoginUserRpc,
  decryptLoginUser: decryptLoginUserRpc,
};
