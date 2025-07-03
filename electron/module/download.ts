import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { dataDir } from "@electron/shared/path";

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

[comicDownloadDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, {
      recursive: true,
    });
  }
});

[downloadDownloadingFilepath, downloadCompleteFilepath].forEach((path) => {
  if (!existsSync(path)) {
    writeFileSync(path, "[]");
  }
});

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
