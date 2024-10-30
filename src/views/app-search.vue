<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";

const formState = reactive({
  content: "",
  order: "mr",
});

const { page, pageSize, pageCount, data, send, loading } = usePagination(
  (page) =>
    getComicListApi({
      page,
      content: formState.content,
      order: formState.order,
    }),
  {
    immediate: false,
    initialPage: 1,
    initialPageSize: 80,
    data: (res) => res.data.content,
    total: (res) => res.data.total,
    watchingStates: [() => formState.order],
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
      <div class="flex mb-4">
        <div class="w-[200px]">
          <v-select
            v-model:model-value="formState.order"
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
        <div class="flex-grow">
          <v-text-field
            v-model:model-value="formState.content"
            placeholder="车牌号，名称，作者"
          >
            <template #append>
              <v-btn variant="text" icon="mdi-magnify" @click="send(1, 80)" />
            </template>
          </v-text-field>
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
      <div class="flex justify-end mt-4">
        <v-pagination v-model="page" :length="pageCount"></v-pagination>
      </div>
    </template>
  </v-data-iterator>
</template>

<style scoped></style>
