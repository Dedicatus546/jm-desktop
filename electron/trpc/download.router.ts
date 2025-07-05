import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import {
  comicDownloadDir,
  getDownloadCompleteList,
  getDownloadDownloadingList,
  saveDownloadCompleteList,
  saveDownloadDownloadingList,
} from "@electron/module/download";
import { createLogger } from "@electron/module/logger";
import { decodeImage } from "@electron/shared/decode-image";
import archiver from "archiver";
import { net } from "electron";
import pLimit from "p-limit";
import nameSanitizer from "sanitize-filename";
import { z } from "zod";

import { trpc } from "./trpc";

const { info } = createLogger("download.router");

const limit = pLimit(3);

const onDownloadComicRpc = trpc.procedure
  .input(
    z.object({
      id: z.number(),
      comicName: z.string(),
      chapterName: z.string(),
      picUrlList: z.array(z.string()),
    }),
  )
  .subscription(async function* (opts) {
    const query = opts.input;
    info("%d 开始处理下载", query.id);
    const dirname = `${query.comicName}`;
    const filename = `[${query.id}] ${query.chapterName}.zip`;
    const fileDir = resolve(comicDownloadDir, nameSanitizer(dirname));
    info("%d 标准化文件目录路径 %s", query.id, fileDir);
    const filepath = resolve(fileDir, nameSanitizer(filename));
    info("%d 标准化文件路径 %s", query.id, filepath);
    let complete = 0;
    const total = query.picUrlList.length;
    const list = query.picUrlList.map((url) =>
      limit(async () => {
        const res = await net.fetch(url, {
          method: "GET",
        });
        const arrayBuffer = await res.arrayBuffer();
        info("%d 已获取 %s 图片 arrayBuffer 数据", query.id, url);
        const decodeArrayBuffer = await decodeImage(url, arrayBuffer, query.id);
        info("%d 已解密 %s 图片数据", query.id, url);
        return decodeArrayBuffer;
      }),
    );
    for (const p of list) {
      await p;
      complete++;
      yield {
        type: "downloading",
        data: {
          complete,
          total,
        },
      };
    }
    const arrayBufferList = await Promise.all(list);
    info("%d 所有图片下载完成", query.id);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });
    arrayBufferList.forEach((arrayBuffer, index) => {
      archive.append(Buffer.from(arrayBuffer), {
        name: `${index + 1}.webp`,
      });
    });
    if (!existsSync(fileDir)) {
      mkdirSync(fileDir, {
        recursive: true,
      });
    }
    const output = createWriteStream(filepath);
    archive.pipe(output);
    await archive.finalize();
    info("%d 所有图片压缩完成，文件地址为 %s", query.id, filepath);
    yield {
      type: "complete",
      data: {
        filepath,
      },
    };
  });

const getDownloadDownloadingListRpc = trpc.procedure.query(() => {
  return getDownloadDownloadingList();
});

const getDownloadCompleteListRpc = trpc.procedure.query(() => {
  return getDownloadCompleteList();
});

const saveDownloadDownloadingListRpc = trpc.procedure
  .input(z.array(z.any()))
  .query(({ input }) => {
    return saveDownloadDownloadingList(input);
  });

const saveDownloadCompleteListRpc = trpc.procedure
  .input(z.array(z.any()))
  .query(({ input }) => {
    return saveDownloadCompleteList(input);
  });

export const router = {
  onDownloadComic: onDownloadComicRpc,
  getDownloadDownloadingList: getDownloadDownloadingListRpc,
  getDownloadCompleteList: getDownloadCompleteListRpc,
  saveDownloadDownloadingList: saveDownloadDownloadingListRpc,
  saveDownloadCompleteList: saveDownloadCompleteListRpc,
};
