<script setup lang="ts">
import { usePagination } from "alova/client";

import { getUserCommentListApi } from "@/apis";
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
      <div class="h-[30vh] flex items-center justify-center">
        <v-progress-circular indeterminate></v-progress-circular>
      </div>
    </template>
    <template #default="{ items }">
      <v-row>
        <template v-for="item of items" :key="item.raw.id">
          <v-col cols="12">
            <comment-item :comment="item.raw" />
          </v-col>
          <v-col>
            <v-divider />
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
