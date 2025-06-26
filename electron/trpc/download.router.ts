import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

import { dataDir } from "@electron/shared/path";
import archiver from "archiver";
import { net } from "electron";
// import Database from "better-sqlite3";
import pLimit from "p-limit";
import { z } from "zod";

import { trpc } from "./trpc";

const limit = pLimit(3);

const downloadDir = resolve(dataDir, "download");
// const dbFilepath = resolve(downloadDir, "data.db");
// const db = new Database(dbFilepath);

// db.exec(
//   `CREATE TABLE IF NOT EXISTS download_comic (
//     cover VARCHAR(255),
//     path_word VARCHAR(255),
//     name VARCHAR(255),
//     group_path_word VARCHAR(255),
//     group_name VARCHAR(255),
//     chapter_id VARCHAR(255),
//     PRIMARY KEY(path_word, group_path_word, chapter_id)
//   );
//   CREATE TABLE IF NOT EXISTS author (
//     path_word VARCHAR(255) PRIMARY KEY,
//     name VARCHAR(255)
//   );
//   CREATE TABLE IF NOT EXISTS download_comic_author (
//     path_word VARCHAR(255),
//     author_path_word VARCHAR(255)
//   );`,
// );

// TODO
const onDownloadComicRpc = trpc.procedure
  .input(
    z.object({
      comicName: z.string(),
      comicPathWord: z.string(),
      groupName: z.string(),
      groupPathWord: z.string(),
      chapterId: z.string(),
      chapterName: z.string(),
      imageUrlList: z.array(z.string()),
    }),
  )
  .subscription(async function* (opts) {
    const query = opts.input;
    const filename = query.chapterName + ".zip";
    const fileDir = resolve(downloadDir, query.comicName, query.groupName);
    const filepath = resolve(fileDir, filename);
    let complete = 0;
    const total = query.imageUrlList.length;
    const list = query.imageUrlList.map((url) =>
      limit(() =>
        net
          .fetch(url, {
            method: "GET",
          })
          .then((res) => res.arrayBuffer()),
      ),
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
    yield {
      type: "complete",
      data: {
        filepath,
      },
    };
  });

// const getDownloadListRpc = trpc.procedure
//   .input(
//     z.object({
//       page: z.number(),
//       pageSize: z.number(),
//     }),
//   )
//   .query(({ input }) => {
//     const { page, pageSize } = input;
//   });

export const router = {
  onDownloadComic: onDownloadComicRpc,
  // getDownloadList: getDownloadListRpc,
};
