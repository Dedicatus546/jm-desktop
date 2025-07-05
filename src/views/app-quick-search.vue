<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/2.jpg";

const props = defineProps<{
  query: string;
}>();

const { page, pageSize, pageCount, data, loading } = usePagination(
  (page) =>
    getComicListApi({
      content: props.query,
      page,
      order: "mr",
    }),
  {
    initialPage: 1,
    initialPageSize: 80,
    data: (res) => res.data.content,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <v-card>
    <template #title> 搜索：{{ props.query }} </template>
    <v-card-text>
      <v-data-iterator
        :items="data"
        :items-per-page="pageSize"
        :loading="loading"
      >
        <template #loader>
          <div
            class="wind-flex wind-h-[30vh] wind-items-center wind-justify-center"
          >
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
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
              <v-col cols="6" :sm="4" :md="3" :lg="2">
                <app-comic-list-item :comic="item.raw" />
              </v-col>
            </template>
          </v-row>
        </template>
        <template #footer>
          <div class="wind-mt-4 wind-flex wind-justify-end">
            <v-pagination
              color="primary"
              v-model="page"
              :length="pageCount"
              :disabled="loading"
              :total-visible="8"
            ></v-pagination>
          </div>
        </template>
      </v-data-iterator>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
