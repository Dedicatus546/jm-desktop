<script setup lang="ts">
import { useRequest } from "alova/client";

import {
  downloadComicApi,
  getComicDownloadInfoApi,
  insertDownloadComicIpc,
  saveDownloadComicIpc,
} from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useDownloadStore from "@/stores/use-download-store";

const props = defineProps<{
  comic: {
    id: number;
    name: string;
    author: string;
  };
  isDownload: boolean;
}>();

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

watchEffect(() => {
  downloadStore.updateDonwloadProgressAction(
    props.comic.id,
    downloading.value.loaded,
  );
});

const download = async () => {
  try {
    await getComicDownloadInfo();
    downloadStore.addDownloadAction({
      ...props.comic,
      total: comicDownloadInfo.value.data.fileSize,
    });
    await downloadComic({
      md5: comicDownloadInfo.value.data.md5,
      expires: comicDownloadInfo.value.data.expires,
    });
    downloadStore.removeDownloadAction(props.comic.id);
    await saveDownloadFile(await file.value.arrayBuffer(), file.value.name);
    await insertDownload();
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <v-btn size="large" block variant="flat" color="primary" @click="download">
    <template #prepend>
      <v-icon
        icon="mdi-download"
        :color="isDownload ? 'green' : undefined"
      ></v-icon>
    </template>
    {{ isDownloading ? percent + "%" : isDownload ? "已下载" : "下载" }}
  </v-btn>
</template>

<style scoped></style>
