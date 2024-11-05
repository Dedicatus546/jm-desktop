<script setup lang="ts">
import { breakpointsAntDesign } from "@vueuse/core";
import { useRequest } from "alova/client";

import { collectComicApi, getComicDetailApi, likeComicApi } from "@/apis";
import useSnackbar from "@/compositions/use-snack-bar";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const props = defineProps<{
  id: number;
}>();
const snackbar = useSnackbar();
const appStore = useAppStore();
const userStore = useUserStore();
const breakpoints = useBreakpoints(breakpointsAntDesign);
const isGreaterLg = breakpoints.greater("lg");
const buttonCols = computed(() => {
  if (!userStore.userInfo) {
    return 12;
  }
  if (isGreaterLg.value) {
    return 3;
  }
  return 6;
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

const activeTabKey = ref<"relevant" | "comment" | "series">("relevant");
const tabList = computed(() => {
  if (!comicInfo.value) {
    return [];
  }
  const list = [];
  if (comicInfo.value.data.seriesList.length > 1) {
    list.push({
      value: "series",
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
    activeTabKey.value = "series";
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
    return item ? `从${item.name}开始阅读` : "阅读";
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
</script>

<template>
  <v-row>
    <v-col v-if="loading || !comicInfo" :cols="12">
      <div class="h-[30vh] flex items-center justify-center">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </v-col>
    <template v-else>
      <v-col :cols="12">
        <v-card>
          <v-card-text>
            <div class="flex gap-4">
              <div class="w-1/4 max-w-[300px] min-w-[200px] flex-shrink-0">
                <v-card variant="text">
                  <v-img
                    :aspect-ratio="3 / 4"
                    alt=""
                    :src="`${appStore.setting.imgHost}/media/albums/${comicInfo.data.id}_3x4.jpg`"
                  />
                </v-card>
              </div>
              <div class="flex flex-col gap-4 flex-grow">
                <div class="flex flex-col">
                  <div class="text-h5">{{ comicInfo.data.name }}</div>
                </div>
                <div>
                  <v-row no-gutters class="gap-3">
                    <v-col
                      v-if="comicInfo.data.authorList.length > 0"
                      :cols="12"
                    >
                      <div class="flex">
                        <div class="text-nowrap">作者：</div>
                        <div class="flex flex-wrap gap-2">
                          <router-link
                            v-for="item of comicInfo.data.authorList"
                            :key="item"
                            :to="toQuickQueryPage(item)"
                          >
                            <span class="font-bold">
                              {{ item }}
                            </span>
                          </router-link>
                        </div>
                      </div>
                    </v-col>
                    <v-col :cols="12">
                      <div class="flex gap-1">
                        <div class="text-nowrap">车牌：</div>
                        <div>
                          <span class="font-bold">
                            JM{{ comicInfo.data.id }}
                          </span>
                        </div>
                      </div>
                    </v-col>
                    <v-col :cols="12">
                      <div class="flex">
                        <div class="text-nowrap">喜欢人数：</div>
                        <div>{{ comicInfo.data.likeCount }}人</div>
                      </div>
                    </v-col>
                    <v-col v-if="comicInfo.data.tagList.length > 0" :cols="12">
                      <div class="flex gap-1">
                        <div class="h-[30px] leading-[30px] text-nowrap">
                          标签：
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <router-link
                            v-for="item of comicInfo.data.tagList"
                            :key="item"
                            :to="toQuickQueryPage(item)"
                          >
                            <v-chip>{{ item }}</v-chip>
                          </router-link>
                        </div>
                      </div>
                    </v-col>
                    <v-col v-if="comicInfo.data.workList.length > 0" :cols="12">
                      <div class="flex gap-1">
                        <div class="h-[30px] leading-[30px] text-nowrap">
                          作品：
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <router-link
                            v-for="item of comicInfo.data.workList"
                            :key="item"
                            :to="toQuickQueryPage(item)"
                          >
                            <v-chip>{{ item }}</v-chip>
                          </router-link>
                        </div>
                      </div>
                    </v-col>
                    <v-col v-if="comicInfo.data.roleList.length > 0" :cols="12">
                      <div class="flex gap-1">
                        <div class="h-[30px] leading-[30px] text-nowrap">
                          登场人物：
                        </div>
                        <div class="flex flex-wrap gap-2">
                          <router-link
                            v-for="item of comicInfo.data.roleList"
                            :key="item"
                            :to="toQuickQueryPage(item)"
                          >
                            <v-chip>{{ item }}</v-chip>
                          </router-link>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </div>
                <div class="mt-auto">
                  <v-row>
                    <v-col :cols="buttonCols">
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
                    <template v-if="userStore.userInfo">
                      <v-col :cols="buttonCols">
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
                      <v-col :cols="buttonCols">
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
                      <v-col :cols="buttonCols">
                        <app-comic-detail-download-button
                          v-model:is-download="comicInfo.data.isDownload"
                          :comic="{
                            id: comicInfo.data.id,
                            name: comicInfo.data.name,
                            author:
                              comicInfo.data.authorList.length > 0
                                ? comicInfo.data.authorList[0]
                                : '',
                            price: comicInfo.data.price,
                            isBuy: comicInfo.data.isBuy,
                          }"
                        />
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
            <v-tab
              v-for="item of tabList"
              :key="item.value"
              :value="item.value"
            >
              {{ item.tab }}
            </v-tab>
          </v-tabs>
          <v-card-text>
            <v-tabs-window v-model:model-value="activeTabKey">
              <v-tabs-window-item value="series">
                <app-comic-detail-series
                  :series-list="comicInfo.data.seriesList"
                  :current-series-id="comicInfo.data.currentSeriesId"
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
    </template>
  </v-row>
</template>

<style scoped lang="less">
.skeleton-comic-cover {
  width: 25%;
  min-width: 200px;
  max-width: 300px;

  :deep(.ant-skeleton-image) {
    width: 100%;
    height: 100%;
  }
}
</style>
