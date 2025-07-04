<script setup lang="ts">
import { breakpointsAntDesign } from "@vueuse/core";
import { useRequest } from "alova/client";

import {
  collectComicApi,
  getComicDetailApi,
  getComicPicListApi,
  likeComicApi,
} from "@/apis";
import useSnackbar from "@/compositions/use-snack-bar";
import { createLogger } from "@/logger";
import useAppStore from "@/stores/use-app-store";
import { useDownloadStore } from "@/stores/use-download-store";
import useUserStore from "@/stores/use-user-store";

const { info } = createLogger("comic");

const props = defineProps<{
  id: number;
}>();
const snackbar = useSnackbar();
const appStore = useAppStore();
const userStore = useUserStore();
const downloadStore = useDownloadStore();
const breakpoints = useBreakpoints(breakpointsAntDesign);
const isGreaterMd = breakpoints.greater("md");
const buttonCols = computed(() => {
  if (!userStore.userInfo) {
    return [12, 12, 12, 12];
  }
  if (isGreaterMd.value) {
    return [12, 12, 6, 6];
  }
  return [12, 12, 12, 12];
});

const {
  loading,
  data: comicInfo,
  send,
  onSuccess,
} = useRequest((id: number) => getComicDetailApi(id), {
  immediate: false,
});

watchEffect(() => {
  send(props.id);
});

const activeTabKey = ref<"relevant" | "comment" | "chapter">("relevant");
const tabList = computed(() => {
  if (!comicInfo.value) {
    return [];
  }
  const list = [];
  if (comicInfo.value.data.seriesList.length > 1) {
    list.push({
      value: "chapter",
      tab: "目录",
    });
  }
  list.push(
    {
      value: "relevant",
      tab: "相关漫画",
    },
    {
      value: "comment",
      tab: comicInfo.value.data.commentCount + "条评论",
    },
  );
  return list;
});

onSuccess(() => {
  if (comicInfo.value.data.seriesList.length > 1) {
    activeTabKey.value = "chapter";
  }
});

const currentSeriesName = computed(() => {
  if (
    comicInfo.value.data.currentSeriesId &&
    comicInfo.value.data.seriesList.length > 1
  ) {
    const item = comicInfo.value.data.seriesList.find(
      (item) => item.id === comicInfo.value.data.currentSeriesId,
    );
    return item ? `从${item.name}阅读` : "阅读";
  }
  return "阅读";
});

const {
  loading: likeComicLoading,
  send: likeComic,
  onSuccess: likeComicOnSuccess,
  data: likeComicData,
} = useRequest(() => likeComicApi(props.id), {
  immediate: false,
});

likeComicOnSuccess(() => {
  comicInfo.value.data.isLike = true;
  snackbar.primary(likeComicData.value.data.msg);
});

const {
  loading: collectComicLoading,
  send: collectComic,
  onSuccess: collectComicSuccess,
  data: collectComicData,
} = useRequest(() => collectComicApi(props.id), {
  immediate: false,
});

collectComicSuccess(() => {
  comicInfo.value.data.isCollect = true;
  snackbar.primary(collectComicData.value.data.msg);
});

const toQuickQueryPage = (query: string) => {
  return { name: "QUICK_SEARCH", query: { query } };
};

const cover = computed(() =>
  import.meta.env.VITE_NSFW === "on"
    ? "/360x640.svg"
    : `${appStore.setting.imgHost}/media/albums/${comicInfo.value.data.id}_3x4.jpg`,
);

const { data, send: getComicPicList } = useRequest(
  (id: number) => getComicPicListApi(id, appStore.config.currentShuntKey),
  {
    immediate: false,
    initialData: {
      list: [],
    },
  },
);

const download = async () => {
  await getComicPicList(comicInfo.value.data.id);
  downloadStore.addDownloadTaskAction({
    type: "comic",
    id: comicInfo.value.data.id,
    comicName: comicInfo.value.data.name,
    chapterName: comicInfo.value.data.name,
    picUrlList: data.value.list,
    filepath: "",
  });
  snackbar.success("添加下载任务成功");
  info("添加 %s 下载任务", comicInfo.value.data.name);
};
</script>

<template>
  <div
    v-if="loading || !comicInfo"
    class="wind-flex wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <v-row v-else>
    <v-col :cols="12">
      <v-card>
        <v-card-text>
          <div class="wind-flex wind-gap-4">
            <div
              class="wind-flex-shrink-0 wind-max-w-[300px] wind-min-w-[200px] wind-w-1/4"
            >
              <v-card variant="text">
                <v-img :aspect-ratio="3 / 4" cover alt="" :src="cover" />
              </v-card>
            </div>
            <div
              class="wind-leading-6 wind-flex wind-flex-grow wind-flex-col wind-gap-4"
            >
              <div class="wind-flex wind-flex-col wind-gap-2">
                <div class="text-h5">{{ comicInfo.data.name }}</div>
                <div
                  class="wind-flex wind-flex-wrap wind-gap-2"
                  v-if="comicInfo.data.tagList.length > 0"
                >
                  <router-link
                    v-for="item of comicInfo.data.tagList"
                    :key="item"
                    :to="toQuickQueryPage(item)"
                  >
                    <v-chip color="primary">{{ item }}</v-chip>
                  </router-link>
                </div>
              </div>
              <div>
                <v-row no-gutters class="wind-gap-2">
                  <v-col v-if="comicInfo.data.authorList.length > 0" :cols="12">
                    <div class="wind-flex">
                      <div class="wind-text-nowrap">作者：</div>
                      <div class="wind-flex wind-flex-wrap wind-gap-2">
                        <router-link
                          v-for="item of comicInfo.data.authorList"
                          :key="item"
                          :to="toQuickQueryPage(item)"
                        >
                          <span class="wind-font-bold">
                            {{ item }}
                          </span>
                        </router-link>
                      </div>
                    </div>
                  </v-col>
                  <v-col :cols="12">
                    <div class="wind-flex wind-gap-1">
                      <div class="wind-text-nowrap">车牌：</div>
                      <div>
                        <span class="wind-font-bold">
                          JM{{ comicInfo.data.id }}
                        </span>
                      </div>
                    </div>
                  </v-col>
                  <v-col :cols="12">
                    <div class="wind-flex">
                      <div class="wind-text-nowrap">喜欢人数：</div>
                      <div>{{ comicInfo.data.likeCount }}人</div>
                    </div>
                  </v-col>
                  <v-col v-if="comicInfo.data.workList.length > 0" :cols="12">
                    <div class="wind-flex wind-gap-1">
                      <div
                        class="wind-leading-[30px] wind-h-[30px] wind-text-nowrap"
                      >
                        作品：
                      </div>
                      <div class="wind-flex wind-flex-wrap wind-gap-2">
                        <router-link
                          v-for="item of comicInfo.data.workList"
                          :key="item"
                          :to="toQuickQueryPage(item)"
                        >
                          <v-chip color="primary">{{ item }}</v-chip>
                        </router-link>
                      </div>
                    </div>
                  </v-col>
                  <v-col v-if="comicInfo.data.roleList.length > 0" :cols="12">
                    <div class="wind-flex wind-gap-1">
                      <div
                        class="wind-leading-[30px] wind-h-[30px] wind-text-nowrap"
                      >
                        登场人物：
                      </div>
                      <div class="wind-flex wind-flex-wrap wind-gap-2">
                        <router-link
                          v-for="item of comicInfo.data.roleList"
                          :key="item"
                          :to="toQuickQueryPage(item)"
                        >
                          <v-chip color="primary">{{ item }}</v-chip>
                        </router-link>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
              <div class="wind-mt-auto">
                <v-row>
                  <v-col :cols="buttonCols[0]">
                    <router-link
                      v-slot="{ navigate }"
                      :to="{ name: 'COMIC_READ', params: { id } }"
                      custom
                    >
                      <v-btn
                        color="primary"
                        variant="flat"
                        size="large"
                        block
                        @click="navigate()"
                      >
                        <template #prepend>
                          <v-icon icon="mdi-book-open"></v-icon>
                        </template>
                        {{
                          comicInfo.data.currentSeriesId
                            ? currentSeriesName
                            : "阅读"
                        }}
                      </v-btn>
                    </router-link>
                  </v-col>
                  <v-col :cols="buttonCols[1]">
                    <v-btn
                      :color="
                        downloadStore.completeMap[id] ? 'success' : 'primary'
                      "
                      variant="flat"
                      size="large"
                      block
                      @click="download"
                    >
                      <template #prepend>
                        <v-icon icon="mdi-download"></v-icon>
                      </template>
                      {{ downloadStore.completeMap[id] ? "已下载" : "下载" }}
                    </v-btn>
                  </v-col>
                  <template v-if="userStore.userInfo">
                    <v-col :cols="buttonCols[2]">
                      <v-btn
                        color="primary"
                        variant="flat"
                        :loading="likeComicLoading"
                        size="large"
                        block
                        :disabled="comicInfo.data.isLike"
                        @click="likeComic()"
                      >
                        <template #prepend>
                          <v-icon
                            icon="mdi-heart"
                            :color="comicInfo.data.isLike ? 'red' : undefined"
                          ></v-icon>
                        </template>
                        {{ comicInfo.data.isLike ? "已喜欢" : "喜欢" }}
                      </v-btn>
                    </v-col>
                    <v-col :cols="buttonCols[3]">
                      <v-btn
                        color="primary"
                        variant="flat"
                        :loading="collectComicLoading"
                        size="large"
                        block
                        @click="collectComic()"
                      >
                        <template #prepend>
                          <v-icon
                            icon="mdi-book-heart"
                            :color="
                              comicInfo.data.isCollect ? '#834e00' : undefined
                            "
                          ></v-icon>
                        </template>
                        {{ comicInfo.data.isCollect ? "已收藏" : "收藏" }}
                      </v-btn>
                    </v-col>
                  </template>
                </v-row>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col :cols="12">
      <v-card>
        <v-tabs v-model:model-value="activeTabKey" bg-color="primary">
          <v-tab v-for="item of tabList" :key="item.value" :value="item.value">
            {{ item.tab }}
          </v-tab>
        </v-tabs>
        <v-card-text>
          <v-tabs-window v-model:model-value="activeTabKey">
            <v-tabs-window-item value="chapter">
              <app-comic-detail-chapter
                :comic-name="comicInfo.data.name"
                :chapter-list="comicInfo.data.seriesList"
                :current-chapter-id="comicInfo.data.currentSeriesId"
              />
            </v-tabs-window-item>
            <v-tabs-window-item value="relevant">
              <app-comic-detail-relevant
                :relate-list="comicInfo.data.relateList"
              />
            </v-tabs-window-item>
            <v-tabs-window-item value="comment">
              <app-comic-detail-comment :comic-id="id" />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
