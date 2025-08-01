<script setup lang="ts">
import { useRequest } from "alova/client";

import { getComicPicListApi } from "@/apis";
import useDialog from "@/compositions/use-dialog";
import useSnackbar from "@/compositions/use-snack-bar";
import { createLogger } from "@/logger";
import useAppStore from "@/stores/use-app-store";
import { useDownloadStore } from "@/stores/use-download-store";

const { info } = createLogger("comic");

const props = defineProps<{
  chapterList: Array<{
    id: number;
    name: string;
  }>;
  currentChapterId?: number;
  comicName: string;
}>();

const appStore = useAppStore();
const downloadStore = useDownloadStore();
const snackbar = useSnackbar();
const dialog = useDialog();

const { data, send } = useRequest(
  (id: number) => getComicPicListApi(id, appStore.config.currentShuntKey),
  {
    immediate: false,
    initialData: {
      list: [],
    },
  },
);

const downloadChapter = async (chapter: { id: number; name: string }) => {
  if (downloadStore.downloadingMap[chapter.id]) {
    snackbar.warning("任务正在下载中，请勿重复点击");
    return;
  }
  if (downloadStore.completeMap[chapter.id]) {
    dialog({
      width: 300,
      title: "确认",
      content: "该漫画已下载，是否重新下载？",
      async onOk() {
        await send(chapter.id);
        downloadStore.addDownloadTaskAction(
          {
            type: "comic",
            id: chapter.id,
            comicName: props.comicName,
            chapterName: chapter.name,
            picUrlList: data.value.list,
            filepath: "",
          },
          true,
        );
        snackbar.success("添加下载任务成功");
        info("添加 %s %s 下载任务", props.comicName, chapter.name);
      },
    });
    return;
  }
  await send(chapter.id);
  downloadStore.addDownloadTaskAction({
    type: "comic",
    id: chapter.id,
    comicName: props.comicName,
    chapterName: chapter.name,
    picUrlList: data.value.list,
    filepath: "",
  });
  snackbar.success("添加下载任务成功");
  info("添加 %s %s 下载任务", props.comicName, chapter.name);
};
</script>

<template>
  <v-row class="wind-p-1">
    <v-col v-for="item of chapterList" :key="item.id" :cols="12" :lg="6">
      <router-link :to="{ name: 'COMIC_READ', params: { id: item.id } }" custom>
        <template #default="{ navigate }">
          <v-row no-gutters class="wind-gap-2 wind-items-center">
            <v-col class="wind-min-w-0">
              <app-scroll-wrapper>
                {{ item.name }}
              </app-scroll-wrapper>
            </v-col>
            <v-col cols="auto">
              <v-btn
                variant="flat"
                class="chapter-btn"
                :color="currentChapterId === item.id ? 'primary' : undefined"
                @click="navigate()"
              >
                <template #prepend>
                  <v-icon icon="mdi-book-open"></v-icon>
                </template>
                阅读
              </v-btn>
              <v-btn
                variant="flat"
                :color="
                  downloadStore.downloadingMap[item.id]
                    ? 'info'
                    : downloadStore.completeMap[item.id]
                      ? 'success'
                      : undefined
                "
                class="chapter-btn wind-ml-2"
                @click="downloadChapter(item)"
              >
                <template #prepend>
                  <v-icon icon="mdi-download"></v-icon>
                </template>
                {{
                  downloadStore.downloadingMap[item.id]
                    ? "正在下载 " +
                      ((
                        downloadStore.downloadingMap[item.id]!.percent * 100
                      ).toFixed(2) +
                        "%")
                    : downloadStore.completeMap[item.id]
                      ? "已下载"
                      : "下载"
                }}
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </router-link>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
.chapter-btn {
  ::v-deep(.v-btn__content) {
    min-width: 0;
  }
}
</style>
