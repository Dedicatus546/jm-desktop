import { DownloadComicItem, DownloadItem } from "@electron/module/download";
import { omit } from "radash";

import { trpcClient } from "@/apis/ipc";
import { createLogger } from "@/logger";
import { emitter } from "@/mitt";

const { info, warn } = createLogger("download");

type WithDownloadingInfo<T> = T & {
  status: "downloading" | "pending" | "complete";
  percent: number; // 0 - 1
};

export const useDownloadStore = defineStore("download", () => {
  const state = reactive<{
    activeTabKey: "downloading" | "complete";
    loading: boolean;
    completeList: Array<DownloadItem>;
    downloadingList: Array<WithDownloadingInfo<DownloadItem>>;
  }>({
    activeTabKey: "downloading",
    loading: false,
    completeList: [],
    downloadingList: [],
  });

  const initAction = async () => {
    await Promise.allSettled([
      trpcClient.getDownloadDownloadingList.query().then((list) => {
        state.downloadingList = list.map((item) => {
          return {
            ...item,
            status: "pending",
            percent: 0,
          };
        });
      }),
      trpcClient.getDownloadCompleteList.query().then((list) => {
        state.completeList = list;
      }),
    ]);
    if (state.downloadingList.length > 0) {
      info("初始化检测到存在未完成下载任务，尝试开始下载。");
      tryStartDownloadAction();
    }
  };

  const addDownloadTaskAction = (item: DownloadItem) => {
    state.downloadingList.push({
      ...item,
      status: "pending",
      percent: 0,
    });
    tryStartDownloadAction();
  };

  const tryStartDownloadAction = async () => {
    const first = state.downloadingList[0];
    if (!first) {
      warn("未检测到可下载的任务");
      return;
    }
    if (first.status === "pending") {
      if (first.type === "comic") {
        await downloadComicAction(first);
      }
    }
    // 尝试下载下一项
    tryStartDownloadAction();
  };

  const downloadComicAction = async (
    downloadItem: WithDownloadingInfo<DownloadComicItem>,
  ) => {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    trpcClient.onDownloadComic.subscribe(
      {
        id: downloadItem.id,
        comicName: downloadItem.comicName,
        chapterName: "",
        picUrlList: downloadItem.picUrlList,
      },
      {
        onStarted() {
          downloadItem.status = "downloading";
        },
        onData(value) {
          if (value.type === "downloading") {
            downloadItem.percent = value.data.complete! / value.data.total!;
          } else if (value.type === "complete") {
            downloadItem.status = "complete";
            downloadItem.filepath = value.data.filepath!;
            const index = state.downloadingList.findIndex(
              (item) => item.id === downloadItem.id,
            );
            if (index > -1) {
              const [item] = state.downloadingList.splice(index, 1);
              state.completeList.push(
                omit(item as WithDownloadingInfo<DownloadComicItem>, [
                  "status",
                  "percent",
                ]),
              );
              resolve();
            } else {
              reject(
                new Error("下载列表内找不到对应项，uuid 为 " + downloadItem.id),
              );
            }
          }
        },
        onError(err) {
          reject(err);
        },
      },
    );
    try {
      await promise;
    } catch (e) {
      console.error(e);
    }
    await syncAction();
    emitter.emit("DownloadSuccess", downloadItem);
  };

  const syncAction = async () => {
    await trpcClient.saveDownloadDownloadingList.query(
      state.downloadingList.map((item) => omit(item, ["status", "percent"])),
    );
    await trpcClient.saveDownloadCompleteList.query(state.completeList);
  };

  return {
    ...toRefs(state),
    initAction,
    addDownloadTaskAction,
    downloadComicAction,
  };
});
