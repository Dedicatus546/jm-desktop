<!-- <script setup lang="ts">
import { useRequest } from "alova/client";

import { buyComicApi, downloadComicApi, getComicDownloadInfoApi } from "@/apis";
import useDialog from "@/compositions/use-dialog";
import useSnackbar from "@/compositions/use-snack-bar";
import { error } from "@/logger";
import { emitter } from "@/mitt";
import { useDownloadStore } from "@/stores/use-download-store";
import useUserStore from "@/stores/use-user-store";
import { resolveDownloadFileName } from "@/utils";

const props = defineProps<{
  comic: {
    id: number;
    name: string;
    author: string;
    price: number;
    isBuy: boolean;
    seriesList: Array<{
      id: number;
      name: string;
    }>;
  };
}>();
const showSeriesSelectDialog = ref(false);

const dialog = useDialog();
const snackbar = useSnackbar();
const userStore = useUserStore();
const downloadStore = useDownloadStore();
const isDownloading = computed(() =>
  downloadStore.pendingMap.has(props.comic.id),
);
const percent = computed(() => {
  if (!isDownloading.value) {
    return 0;
  }
  const item = downloadStore.pendingMap.get(props.comic.id)!;
  return item.total === 0 ? 0 : +((item.loaded / item.total) * 100).toFixed(0);
});

// const insertDownload = async () => {};

// const { invoke: insertDownload } = useIpcRendererInvoke(
//   (query: {
//     id: number;
//     name: string;
//     belongId: number;
//     fileName: string;
//     seriesName: string;
//   }) =>
//     insertDownloadComicIpc({
//       id: query.id,
//       belongId: query.belongId,
//       name: query.name,
//       fileName: query.fileName,
//       seriesName: query.seriesName,
//       author: props.comic.author,
//     }),
//   {
//     immediate: false,
//   },
// );

// const saveDownloadFile = async () => {};

// const { invoke: saveDownloadFile } = useIpcRendererInvoke(
//   (buffer: ArrayBuffer, name: string) => saveDownloadComicIpc(buffer, name),
//   {
//     immediate: false,
//   },
// );

const { data: comicDownloadInfo, send: getComicDownloadInfo } = useRequest(
  (id: number) => getComicDownloadInfoApi(id),
  {
    immediate: false,
  },
);

const {
  // data: file,
  send: downloadComic,
  downloading,
} = useRequest(
  (query: {
    md5: string;
    expires: number;
    comicId: number;
    fileName: string;
  }) =>
    downloadComicApi({
      md5: query.md5,
      expires: query.expires,
      comicId: query.comicId,
      fileName: query.fileName,
    }),
  {
    immediate: false,
  },
);

const {
  onSuccess,
  data: buyComicData,
  send: buyComic,
} = useRequest(() => buyComicApi(props.comic.id), {
  immediate: false,
});

onSuccess(() => {
  snackbar.success(buyComicData.value.data.msg);
});

const ok = () => {
  if (props.comic.price > 0 && !props.comic.isBuy) {
    dialog({
      width: "50%",
      title: "确认购买？",
      content: `该本子为 JM 付费本，是否支付 ${props.comic.price} JCoin 购买？`,
      onOk: async () => {
        await buy();
      },
    });
    return;
  }
  // 2024.11.05
  // 系列的话目前应该不会有需要付费的情况
  if (props.comic.seriesList.length > 0) {
    showSeriesSelectDialog.value = true;
    return;
  }
  download();
};

const onSelectSeriesDownload = (series: { id: number; name: string }) => {
  showSeriesSelectDialog.value = false;
  download(series);
};

const buy = async () => {
  if (userStore.userInfo!.jCoin < props.comic.price) {
    snackbar.warning(
      `当前的 JCoin 数量 ${userStore.userInfo!.jCoin} 不足以支付`,
    );
    error(`购买漫画失败，原因 JCoin 不足`);
    return;
  }
  try {
    await buyComic();
  } catch (e) {
    error(`购买漫画失败，原因 ${String(e)}`);
    return;
  }
  download();
};

const download = async (series?: { id: number; name: string }) => {
  try {
    const id = series ? series.id : props.comic.id;
    const belongId = props.comic.id;
    const name = props.comic.name;
    const seriesName = series ? series.name : "";
    const fileName = resolveDownloadFileName(
      id,
      props.comic.name + (seriesName ? `[${seriesName}]` : ""),
    );
    await getComicDownloadInfo(id);
    downloadStore.addDownloadAction({
      id,
      belongId,
      name,
      fileName,
      seriesName,
      author: props.comic.author,
      total: comicDownloadInfo.value.data.fileSize,
    });
    downloadStore.updateDonwloadProgressAction(
      id,
      computed(() => downloading.value.loaded),
    );
    await downloadComic({
      comicId: id,
      fileName,
      md5: comicDownloadInfo.value.data.md5,
      expires: comicDownloadInfo.value.data.expires,
    });
    downloadStore.removeDownloadAction(id);
    // await saveDownloadFile(await file.value.arrayBuffer(), file.value.name);
    // await insertDownload({
    //   id,
    //   name,
    //   belongId,
    //   fileName,
    //   seriesName: series ? series.name : "",
    // });
    emitter.emit("RefreshCompleteDownloadList");
    snackbar.success("下载成功");
  } catch (e) {
    snackbar.error("下载出错，请打开日志查看详细错误");
    error(`下载出错，原因 ${String(e)}`);
  }
};
</script>

<template>
  <v-btn
    size="large"
    block
    variant="flat"
    color="primary"
    :loading="isDownloading"
    @click="ok"
  >
    <template #prepend>
      <v-icon icon="mdi-download"></v-icon>
    </template>
    <template #loader>
      {{ percent + "%" }}
    </template>
    下载
  </v-btn>
  <v-dialog v-model:model-value="showSeriesSelectDialog" width="80%">
    <v-card title="选择下载章节">
      <v-card-text class="wind-h-[60vh] wind-overflow-auto">
        <v-row>
          <v-col
            v-for="item of comic.seriesList"
            :key="item.id"
            :cols="6"
            :md="4"
            :lg="3"
          >
            <v-btn size="large" block @click="onSelectSeriesDownload(item)">
              {{ item.name }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped></style> -->

<template>
  <div>该组件已废弃，下载不再使用 jm 的下载接口</div>
</template>
