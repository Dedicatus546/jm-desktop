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
const buttonColSpan = computed(() => {
  if (!userStore.userInfo) {
    return 8;
  }
  if (isGreaterLg.value) {
    return 6;
  }
  return 12;
});

const {
  loading,
  data: comicInfo,
  send,
} = useRequest((id: number) => getComicDetailApi(id), {
  immediate: false,
});

watchEffect(() => {
  send(props.id);
});

const activeTabKey = ref<"relevant" | "comment">("relevant");
const tabList = computed(() => {
  if (!comicInfo.value) {
    return [];
  }
  return [
    {
      key: "relevant",
      tab: "相关漫画",
    },
    {
      key: "comment",
      tab: comicInfo.value.data.commentCount + "条评论",
    },
  ];
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
</script>

<template>
  <a-row :gutter="[16, 16]">
    <template v-if="loading || !comicInfo">
      <a-col :span="24">
        <a-card>
          <a-flex :gap="16">
            <a-skeleton-image class="skeleton-comic-cover aspect-[3/4]" />
            <a-flex class="flex-grow" vertical justify="space-between">
              <a-skeleton active title></a-skeleton>
              <a-row :gutter="[16, 16]">
                <a-col v-for="item of 4" :key="item" :span="6">
                  <a-skeleton-button block active></a-skeleton-button>
                </a-col>
              </a-row>
            </a-flex>
          </a-flex>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card>
          <a-row :gutter="[16, 16]">
            <a-col v-for="item of 8" :key="item" :sm="8" :xl="6" :xxl="4">
              <comic-item-skeleton />
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </template>
    <template v-else>
      <a-col :span="24">
        <a-card>
          <a-flex :gap="16">
            <div class="w-1/4 max-w-[300px] min-w-[200px] flex-shrink-0">
              <img
                loading="lazy"
                class="block aspect-[3/4] w-full"
                alt=""
                :src="`${appStore.setting.imgHost}/media/albums/${comicInfo.data.id}_3x4.jpg`"
              />
            </div>
            <a-flex vertical class="flex-grow">
              <a-typography-title :level="3">
                {{ comicInfo.data.name }}
              </a-typography-title>
              <div class="mb-4">
                <a-descriptions
                  :label-style="{
                    color: 'rgba(0, 0, 0, 0.45)',
                  }"
                  :column="1"
                >
                  <a-descriptions-item
                    v-if="comicInfo.data.authorList.length > 0"
                    label="作者"
                  >
                    <a-flex wrap="wrap" :gap="8">
                      <!-- 作者可点击 -->
                      <a-typography-text
                        v-for="item of comicInfo.data.authorList"
                        :key="item"
                        class="font-bold"
                      >
                        {{ item }}
                      </a-typography-text>
                    </a-flex>
                  </a-descriptions-item>
                  <a-descriptions-item
                    v-if="comicInfo.data.authorList.length > 0"
                    label="车牌"
                  >
                    <a-typography-text copyable>
                      JM{{ comicInfo.data.id }}
                    </a-typography-text>
                  </a-descriptions-item>
                  <a-descriptions-item
                    v-if="comicInfo.data.tagList.length > 0"
                    label="标签"
                  >
                    <a-flex wrap="wrap" :gap="8">
                      <!-- TODO 快捷搜索 -->
                      <router-link
                        v-for="item of comicInfo.data.tagList"
                        :key="item"
                        to="/search"
                      >
                        <a-tag class="mr-0">{{ item }}</a-tag>
                      </router-link>
                    </a-flex>
                  </a-descriptions-item>
                  <a-descriptions-item
                    v-if="comicInfo.data.workList.length > 0"
                    label="作品"
                  >
                    <a-flex wrap="wrap" :gap="8">
                      <!-- TODO 快捷搜索 -->
                      <router-link
                        v-for="item of comicInfo.data.workList"
                        :key="item"
                        to="/search"
                      >
                        <a-tag class="mr-0">{{ item }}</a-tag>
                      </router-link>
                    </a-flex>
                  </a-descriptions-item>
                  <a-descriptions-item
                    v-if="comicInfo.data.roleList.length > 0"
                    label="登场人物"
                  >
                    <a-flex wrap="wrap" :gap="8">
                      <!-- TODO 快捷搜索 -->
                      <router-link
                        v-for="item of comicInfo.data.roleList"
                        :key="item"
                        to="/search"
                      >
                        <a-tag class="mr-0">{{ item }}</a-tag>
                      </router-link>
                    </a-flex>
                  </a-descriptions-item>
                </a-descriptions>
              </div>
              <a-row :gutter="[16, 16]" class="mt-auto">
                <a-col :span="buttonColSpan">
                  <router-link
                    v-slot="{ navigate }"
                    :to="{ name: 'COMIC_READ', params: { id } }"
                    custom
                  >
                    <a-button size="large" block @click="navigate()">
                      <template #icon>
                        <ReadOutlined />
                      </template>
                      阅读
                    </a-button>
                  </router-link>
                </a-col>
                <a-col :span="buttonColSpan">
                  <a-button
                    :loading="likeComicLoading"
                    size="large"
                    block
                    @click="likeComic()"
                  >
                    <template #icon>
                      <HeartFilled
                        v-if="comicInfo.data.isLike"
                        style="color: red"
                      ></HeartFilled>
                      <HeartOutlined v-else style="color: red" />
                    </template>
                    {{ comicInfo.data.isLike ? "已喜欢" : "喜欢" }}
                  </a-button>
                </a-col>
                <a-col :span="buttonColSpan">
                  <a-button
                    :loading="collectComicLoading"
                    size="large"
                    block
                    @click="collectComic()"
                  >
                    <template #icon>
                      <BookFilled
                        v-if="comicInfo.data.isCollect"
                        style="color: orange"
                      />
                      <BookOutlined v-else style="color: orange" />
                    </template>
                    {{ comicInfo.data.isCollect ? "已收藏" : "收藏" }}
                  </a-button>
                </a-col>
                <a-col v-if="userStore.userInfo" :span="buttonColSpan">
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
                </a-col>
              </a-row>
            </a-flex>
          </a-flex>
        </a-card>
      </a-col>
      <a-col :span="24">
        <a-card
          :tab-list="tabList"
          :active-tab-key="activeTabKey"
          @tab-change="(key) => (activeTabKey = key as any)"
        >
          <a-row v-if="activeTabKey === 'relevant'" :gutter="[16, 16]">
            <a-col
              v-for="item of comicInfo.data.relateList"
              :key="item.id"
              :sm="8"
              :xl="6"
              :xxl="4"
            >
              <comic-item replace :comic="item" />
            </a-col>
          </a-row>
          <app-comic-detail-comment
            v-else-if="activeTabKey === 'comment'"
            :comic-id="id"
          />
        </a-card>
      </a-col>
    </template>
  </a-row>
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
