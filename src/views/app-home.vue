<script setup lang="ts">
import { breakpointsVuetifyV3 } from "@vueuse/core";
import { useRequest } from "alova/client";

import { getLatestComicListApi, getPromoteComicListApi } from "@/apis";

const router = useRouter();

const { loading, data } = useRequest(() => getPromoteComicListApi(), {
  initialData: {
    list: [],
  },
});
const { loading: latestLoading, data: latestData } = useRequest(() =>
  getLatestComicListApi(1),
);

const breakpoints = useBreakpoints(breakpointsVuetifyV3);
const isGreaterXXL = breakpoints.greater("xxl");
const isGreaterXL = breakpoints.greater("xl");
const isGreaterSM = breakpoints.greater("sm");
const slidesPerView = computed(() => {
  if (isGreaterXXL.value) {
    return 6.3;
  } else if (isGreaterXL.value) {
    return 5.3;
  } else if (isGreaterSM.value) {
    return 4.3;
  }
  return 3.3;
});
const minListCount = computed(() => {
  if (isGreaterXXL.value) {
    return 7;
  } else if (isGreaterXL.value) {
    return 6;
  } else if (isGreaterSM.value) {
    return 5;
  }
  return 4;
});

const searchText = ref("");
const search = () => {
  if (!searchText.value) {
    return;
  }
  router.push({
    name: "SEARCH",
    query: {
      content: searchText.value,
    },
  });
};
</script>

<template>
  <div
    v-if="loading || latestLoading"
    class="wind-flex wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <v-row v-else>
    <v-col :cols="12">
      <v-row>
        <v-col>
          <v-form @submit.prevent="search">
            <v-text-field
              color="primary"
              v-model:model-value="searchText"
              variant="solo"
              placeholder="输入漫画名称进行搜索"
              hide-details
            >
              <template #append-inner>
                <v-btn
                  :disabled="!searchText"
                  color="primary"
                  type="submit"
                  variant="text"
                  icon="mdi-magnify"
                  @click="search"
                ></v-btn>
              </template>
            </v-text-field>
          </v-form>
        </v-col>
        <v-col cols="auto">
          <v-tooltip text="本子分类" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                size="large"
                icon="mdi-tag"
                :to="{
                  name: 'CATEGORY',
                }"
              ></v-btn>
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="auto">
          <v-tooltip text="每周必看" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="primary"
                size="large"
                icon="mdi-eye"
                :to="{
                  name: 'WEEK',
                }"
              ></v-btn>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-col>
    <v-col v-for="item of data.data" :key="item.id" :cols="12">
      <v-card :title="item.title">
        <v-card-text>
          <v-row v-if="item.list.length < minListCount">
            <v-col
              v-for="subItem of item.list"
              :key="subItem.id"
              :cols="6"
              :sm="4"
              :md="3"
              :lg="2"
            >
              <app-comic-list-item :comic="subItem" />
            </v-col>
          </v-row>
          <app-home-swiper
            v-else
            :list="item.list"
            :slides-per-view="slidesPerView"
          ></app-home-swiper>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col :cols="12">
      <v-card>
        <v-card-item>
          <div class="wind-flex wind-items-center wind-justify-between">
            <v-card-title>最新发布</v-card-title>
            <router-link custom :to="{ name: 'COMIC_LATEST' }">
              <template #default="{ navigate }">
                <v-btn variant="text" @click="navigate()">更多</v-btn>
              </template>
            </router-link>
          </div>
        </v-card-item>
        <v-card-text>
          <v-row>
            <v-col
              v-for="item of latestData.data"
              :key="item.id"
              :cols="6"
              :sm="4"
              :md="3"
              :lg="2"
            >
              <app-comic-list-item :comic="item" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
