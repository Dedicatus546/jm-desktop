<script setup lang="ts">
import { useRequest } from "alova/client";

import {
  buyComicApi,
  downloadComicApi,
  getComicDownloadInfoApi,
  insertDownloadComicIpc,
  saveDownloadComicIpc,
} from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useSnackbar from "@/compositions/use-snack-bar";
import logger from "@/logger";
import useDownloadStore from "@/stores/use-download-store";
import useUserStore from "@/stores/use-user-store";

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
const showDownloadConfirmDialog = ref(false);
const showSeriesSelectDialog = ref(false);

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

const { invoke: insertDownload } = useIpcRendererInvoke(
  (query: { id: number; name: string }) =>
    insertDownloadComicIpc({
      id: query.id,
      name: query.name,
      author: props.comic.author,
    }),
  {
    immediate: false,
  },
);

const { invoke: saveDownloadFile } = useIpcRendererInvoke(
  (buffer: ArrayBuffer, name: string) => saveDownloadComicIpc(buffer, name),
  {
    immediate: false,
  },
);

const { data: comicDownloadInfo, send: getComicDownloadInfo } = useRequest(
  (id: number) => getComicDownloadInfoApi(id),
  {
    immediate: false,
  },
);

const {
  data: file,
  send: downloadComic,
  downloading,
} = useRequest(
  (query: { md5: string; expires: number; comicId: number; name: string }) =>
    downloadComicApi({
      md5: query.md5,
      expires: query.expires,
      comicId: query.comicId,
      name: query.name,
    }),
  {
    immediate: false,
  },
);

const {
  loading: buyComicLoading,
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
    showDownloadConfirmDialog.value = true;
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
    logger.error(`购买漫画失败，原因 JCoin 不足`);
    return;
  }
  try {
    await buyComic();
    showDownloadConfirmDialog.value = false;
  } catch (e) {
    logger.error(`购买漫画失败，原因 ${String(e)}`);
    return;
  }
  download();
};

const download = async (series?: { id: number; name: string }) => {
  try {
    const id = series ? series.id : props.comic.id;
    const name = props.comic.name + (series ? `[${series.name}]` : "");
    await getComicDownloadInfo(id);
    // 这里依然将下载任务附加在本id上，这样可以方便本页获取下载状态
    // 后面可能需要更改
    downloadStore.addDownloadAction({
      id: props.comic.id,
      name,
      author: props.comic.author,
      total: comicDownloadInfo.value.data.fileSize,
    });
    downloadStore.updateDonwloadProgressAction(
      props.comic.id,
      computed(() => downloading.value.loaded),
    );
    await downloadComic({
      comicId: id,
      name,
      md5: comicDownloadInfo.value.data.md5,
      expires: comicDownloadInfo.value.data.expires,
    });
    downloadStore.removeDownloadAction(props.comic.id);
    await saveDownloadFile(await file.value.arrayBuffer(), file.value.name);
    await insertDownload({
      id,
      name,
    });
  } catch (e) {
    snackbar.error("下载出错，请打开日志查看详细错误");
    logger.error(`下载出错，原因 ${String(e)}`);
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
  <v-dialog v-model:model-value="showDownloadConfirmDialog" width="50%">
    <template #default="{ isActive }">
      <v-card title="确认购买？">
        <v-card-text>
          该本子为 JM 付费本，是否支付 {{ comic.price }} JCoin 购买？
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="取消" @click="isActive.value = false"></v-btn>
          <v-btn
            :loading="buyComicLoading"
            color="primary"
            text="确认"
            @click="buy"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <v-dialog v-model:model-value="showDownloadConfirmDialog" width="50%">
    <template #default="{ isActive }">
      <v-card title="确认购买？">
        <v-card-text>
          该本子为 JM 付费本，是否支付 {{ comic.price }} JCoin 购买？
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="取消" @click="isActive.value = false"></v-btn>
          <v-btn
            :loading="buyComicLoading"
            color="primary"
            text="确认"
            @click="buy"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
  <v-dialog v-model:model-value="showSeriesSelectDialog" width="80%">
    <v-card title="选择下载章节">
      <v-card-text class="h-[60vh] overflow-auto">
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

<style scoped></style>
