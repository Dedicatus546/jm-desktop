<script setup lang="ts">
import { breakpointsAntDesign } from "@vueuse/core";
import { useRequest } from "alova/client";

import { collectComicApi, getComicDetailApi, likeComicApi } from "@/apis";
import useAppStore from "@/stores/use-app-store";
import useUserStore from "@/stores/use-user-store";

const props = defineProps<{
  id: number;
}>();
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

const { loading: likeComicLoading, send: likeComic } = useRequest(
  () => likeComicApi(props.id),
  {
    immediate: false,
  },
);

const { loading: collectComicLoading, send: collectComic } = useRequest(
  () => collectComicApi(props.id),
  {
    immediate: false,
  },
);

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
          <v-container fluid>
            <div class="flex gap-4">
              <div class="w-1/4 max-w-[300px] min-w-[200px] flex-shrink-0">
                <v-img
                  :aspect-ratio="3 / 4"
                  alt=""
                  :src="`${appStore.setting.imgHost}/media/albums/${comicInfo.data.id}_3x4.jpg`"
                />
              </div>
              <div class="flex flex-col flex-grow">
                <div class="flex flex-col mb-4">
                  <div class="text-h5">{{ comicInfo.data.name }}</div>
                </div>
                <div>
                  <v-row no-gutters class="gap-4">
                    <v-col
                      v-if="comicInfo.data.authorList.length > 0"
                      :cols="12"
                    >
                      <div class="flex gap-1">
                        <div>作者：</div>
                        <div class="flex flex-wrap gap-2">
                          <router-link
                            v-for="item of comicInfo.data.authorList"
                            :key="item"
                            :to="toQuickQueryPage(item)"
                          >
                            <div class="font-bold">
                              {{ item }}
                            </div>
                          </router-link>
                        </div>
                      </div>
                    </v-col>
                    <v-col :cols="12">
                      <div class="flex gap-1">
                        <div>车牌：</div>
                        <div>
                          <div class="font-bold">JM{{ comicInfo.data.id }}</div>
                        </div>
                      </div>
                    </v-col>
                    <v-col :cols="12">
                      <div class="flex gap-1">
                        <div>喜欢人数：</div>
                        <div>
                          <div>{{ comicInfo.data.likeCount }}人</div>
                        </div>
                      </div>
                    </v-col>
                    <v-col v-if="comicInfo.data.tagList.length > 0" :cols="12">
                      <div class="flex gap-1">
                        <div class="h-[30px] leading-[30px]">标签：</div>
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
                        <div class="h-[30px] leading-[30px]">作品：</div>
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
                        <div class="h-[30px] leading-[30px]">登场人物：</div>
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
                        :to="{ name: 'HOME', params: { id } }"
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
                                comicInfo.data.isCollect ? 'orange' : undefined
                              "
                            ></v-icon>
                          </template>
                          {{ comicInfo.data.isCollect ? "已收藏" : "收藏" }}
                        </v-btn>
                      </v-col>
                      <v-col :cols="buttonCols">
                    <app-comic-detail-download-button
                      :comic="{
                        id: comicInfo.data.id,
                        name: comicInfo.data.name,
                        author:
                          comicInfo.data.authorList.length > 0
                            ? comicInfo.data.authorList[0]
                            : '',
                      }"
                      :is-download="comicInfo.data.isDownload"
                    />
                      </v-col>
                    </template>
                  </v-row>
                </div>
              </div>
            </div>
          </v-container>
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
