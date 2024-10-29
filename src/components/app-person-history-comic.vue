<script setup lang="ts">
import { usePagination } from "alova/client";

import { getHistoryComicListApi } from "@/apis";

const formState = reactive({
  type: "mr",
});

const { page, pageCount, pageSize, loading, data } = usePagination(
  (page) =>
    getHistoryComicListApi({
      page,
      order: formState.type,
    }),
  {
    initialPage: 1,
    initialPageSize: 20,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
    watchingStates: [() => formState.type],
  },
);
</script>

<template>
  <v-data-iterator :items="data" :items-per-page="pageSize" :loading="loading">
    <template #loader>
      <div class="h-[30vh] flex items-center justify-center">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </template>
    <template #header>
      <div class="flex justify-end mb-4">
        <div class="w-[200px]">
          <v-select
            v-model:model-value="formState.type"
            hide-details
            :items="[
              {
                title: '最新',
                value: 'mr',
              },
              {
                title: '最多收藏',
                value: 'mv',
              },
              {
                title: '最多图片',
                value: 'mp',
              },
              {
                title: '最多爱心',
                value: 'tf',
              },
            ]"
          ></v-select>
        </div>
      </div>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="6" :sm="4" :md="3" :lg="2">
            <comic-item :comic="item.raw" />
          </v-col>
        </template>
      </v-row>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>
    </template>
  </v-data-iterator>
</template>

<style scoped></style>
