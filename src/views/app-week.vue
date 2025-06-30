<script setup lang="ts">
import { usePagination, useRequest } from "alova/client";

import { getWeekComicListApi, getWeekListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/2.jpg";

const formState = reactive({
  category: -1,
  type: "manga",
});

const {
  data,
  onSuccess,
  loading: weekLoading,
} = useRequest(() => getWeekListApi());

const {
  // page,
  // total,
  pageSize,
  data: list,
  loading,
} = usePagination(
  (page) =>
    getWeekComicListApi({
      page,
      category: formState.category,
      type: formState.type,
    }),
  {
    // 一般只有一页
    preloadNextPage: false,
    immediate: false,
    initialPage: 1,
    initialPageSize: 80,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
    watchingStates: [() => formState.category, () => formState.type],
  },
);

onSuccess(() => {
  if (data.value.data.categoryList.length > 0) {
    formState.category = data.value.data.categoryList[0].id;
  }
  // if (data.value.data.typeList.length > 0) {
  //   formState.type = data.value.data.typeList[0].id;
  // }
  // send(1, 80);
});
</script>

<template>
  <div
    v-if="weekLoading"
    class="wind-flex wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <v-progress-circular indeterminate></v-progress-circular>
  </div>
  <v-card v-else>
    <v-card-text>
      <v-row>
        <v-col :cols="12">
          <v-data-iterator
            :items-per-page="pageSize"
            :items="list ?? []"
            :loading="loading"
          >
            <template #loader>
              <div
                class="wind-flex wind-h-[30vh] wind-items-center wind-justify-center"
              >
                <v-progress-circular indeterminate></v-progress-circular>
              </div>
            </template>
            <template #header>
              <v-row>
                <v-col :cols="6">
                  <v-select
                    v-model:model-value="formState.category"
                    hide-details
                    item-title="name"
                    item-value="id"
                    :items="data?.data.categoryList ?? []"
                  ></v-select>
                </v-col>
                <v-col :cols="6">
                  <v-select
                    v-model:model-value="formState.type"
                    hide-details
                    item-title="name"
                    item-value="id"
                    :items="data?.data.typeList ?? []"
                  ></v-select>
                </v-col>
              </v-row>
            </template>
            <template #no-data>
              <v-empty-state
                title="出现这个就大概率是出 BUG 了，请提 issue"
                :image="EMPTY_STATE_IMG"
              ></v-empty-state>
            </template>
            <template #default="{ items }">
              <v-row>
                <template v-for="item of items" :key="item.raw.id">
                  <v-col :cols="6" :sm="4" :md="3" :lg="2">
                    <app-comic-list-item :comic="item.raw" />
                  </v-col>
                </template>
              </v-row>
            </template>
          </v-data-iterator>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
