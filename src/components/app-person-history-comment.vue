<script setup lang="ts">
import { usePagination } from "alova/client";

import { getUserCommentListApi } from "@/apis";
import EMPTY_STATE_IMG from "@/assets/empty-state/1.jpg";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();
const { page, pageCount, pageSize, loading, data } = usePagination(
  (page) => getUserCommentListApi(page, userStore.userInfo!.uid),
  {
    initialPage: 1,
    initialPageSize: 10,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <v-data-iterator :items="data" :items-per-page="pageSize" :loading="loading">
    <template #loader>
      <div
        class="wind-flex wind-h-[30vh] wind-items-center wind-justify-center"
      >
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </template>
    <template #no-data>
      <app-empty-state
        title="看来不是很喜欢评论"
        :image="EMPTY_STATE_IMG"
      ></app-empty-state>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="12">
            <app-comment-list-item :comment="item.raw" />
          </v-col>
          <v-col>
            <v-divider />
          </v-col>
        </template>
      </v-row>
    </template>
    <template #footer>
      <div class="mt-4 wind-flex wind-justify-end">
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
