<script setup lang="ts">
import { usePagination } from "alova/client";

import { getCollectComicListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/5.jpg";

const formState = reactive({
  type: "mr",
});

const { page, pageCount, pageSize, loading, data } = usePagination(
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
                title: '收藏时间',
                value: 'mr',
              },
              {
                title: '更新时间',
                value: 'mp',
              },
            ]"
          ></v-select>
        </div>
      </div>
    </template>
    <template #no-data>
      <app-empty-state
        title="一个收藏都没点，看来是用完就忘了"
        :image="EMPTY_STATE_IMG"
      ></app-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col :cols="6" :sm="4" :md="3" :lg="2">
            <comic-route-item :comic="item.raw" />
          </v-col>
        </template>
      </v-row>
    </template>
    <template #footer>
      <div class="flex justify-end mt-4">
        <v-pagination
          v-model="page"
          :length="pageCount"
          :disabled="loading"
          :total-visible="8"
        ></v-pagination>
      </div>
    </template>
  </v-data-iterator>
</template>

<style scoped></style>
