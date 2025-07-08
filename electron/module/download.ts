import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { dataDir } from "@electron/shared/path";
import { exists } from "@electron/shared/utils";

export interface DownloadBaseItem {
  id: number;
  filepath: string;
}

export interface DownloadComicItem extends DownloadBaseItem {
  type: "comic";
  comicName: string;
  chapterName: string;
  picUrlList: Array<string>;
}

export type DownloadItem = DownloadComicItem;

export const downloadDir = resolve(dataDir, "download");

export const comicDownloadDir = resolve(downloadDir, "comic");

export const downloadDownloadingFilepath = resolve(
  downloadDir,
  "downloading.json",
);
export const downloadCompleteFilepath = resolve(downloadDir, "complete.json");

await Promise.all(
  [comicDownloadDir].map(async (dir) => {
    if (!(await exists(dir))) {
      await mkdir(dir, {
        recursive: true,
      });
    }
  }),
);

await Promise.all([
  [downloadDownloadingFilepath, downloadCompleteFilepath].map(async (path) => {
    if (!(await exists(path))) {
      await writeFile(path, "[]");
    }
  }),
]);

export const getDownloadDownloadingList = async () => {
  const content = await readFile(downloadDownloadingFilepath, {
    encoding: "utf-8",
  });
  return JSON.parse(content) as Array<DownloadItem>;
};

export const saveDownloadDownloadingList = async (
  list: Array<DownloadItem>,
) => {
  await writeFile(
    downloadDownloadingFilepath,
    JSON.stringify(list, undefined, 2),
    {
      encoding: "utf-8",
    },
  );
};

export const getDownloadCompleteList = async () => {
  const content = await readFile(downloadCompleteFilepath, {
    encoding: "utf-8",
  });
  return JSON.parse(content) as Array<DownloadItem>;
};

export const saveDownloadCompleteList = async (list: Array<DownloadItem>) => {
  await writeFile(
    downloadCompleteFilepath,
    JSON.stringify(list, undefined, 2),
    {
      encoding: "utf-8",
    },
  );
};
