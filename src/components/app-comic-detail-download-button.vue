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
  };
}>();
const isDownload = defineModel<boolean>("isDownload", {
  default: false,
});
const showDownloadConfirmDialog = ref(false);

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
  () =>
    insertDownloadComicIpc({
      id: props.comic.id,
      name: props.comic.name,
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
  () => getComicDownloadInfoApi(props.comic.id),
  {
    immediate: false,
  },
);

const {
  data: file,
  send: downloadComic,
  downloading,
} = useRequest(
  (query: { md5: string; expires: number }) =>
    downloadComicApi({
      md5: query.md5,
      expires: query.expires,
      comicId: props.comic.id,
      name: props.comic.name,
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
  download();
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

const download = async () => {
  try {
    await getComicDownloadInfo();
    downloadStore.addDownloadAction({
      ...props.comic,
      total: comicDownloadInfo.value.data.fileSize,
    });
    downloadStore.updateDonwloadProgressAction(
      props.comic.id,
      computed(() => downloading.value.loaded),
    );
    await downloadComic({
      md5: comicDownloadInfo.value.data.md5,
      expires: comicDownloadInfo.value.data.expires,
    });
    downloadStore.removeDownloadAction(props.comic.id);
    await saveDownloadFile(await file.value.arrayBuffer(), file.value.name);
    await insertDownload();
    isDownload.value = true;
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <v-btn size="large" block variant="flat" color="primary" @click="ok">
    <template #prepend>
      <v-icon
        icon="mdi-download"
        :color="isDownload ? 'green' : undefined"
      ></v-icon>
    </template>
    {{ isDownloading ? percent + "%" : isDownload ? "已下载" : "下载" }}
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
</template>

<style scoped></style>
