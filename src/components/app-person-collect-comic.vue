<script setup lang="ts">
import { usePagination } from "alova/client";

import { getCollectComicListApi } from "@/apis";

const formState = reactive({
  type: "mr",
});

const { page, pageCount, loading, data } = usePagination(
  (page) =>
    getCollectComicListApi({
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
  <v-row>
    <v-col v-if="loading" :cols="12">
      <div class="h-[30vh] flex items-center justify-center">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </v-col>
    <template v-else>
      <v-col :cols="12">
        <div class="flex justify-end">
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
      </v-col>
      <v-col
        v-for="item of data"
        :key="item.id"
        :cols="6"
        :sm="4"
        :md="3"
        :lg="2"
      >
        <comic-item :comic="item" />
      </v-col>
      <v-col :span="12">
        <div class="flex justify-end">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </v-col>
    </template>
  </v-row>
</template>

<style scoped></style>
