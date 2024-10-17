<script setup lang="ts">
import { usePagination } from "alova/client";

import { getLatestComicListApi } from "@/apis";

const { loading, data, page } = usePagination(
  (page) => getLatestComicListApi(page),
  {
    preloadPreviousPage: false,
    append: true,
    initialPage: 1,
    initialPageSize: 80,
    data: (res) => res.data,
    total: () => 0,
    initialData: {
      data: [],
    },
  },
);
</script>

<template>
  <a-card title="最新发布">
    <a-row :gutter="[16, 16]">
      <a-col v-if="page === 1 && loading" :span="24">
        <a-flex align="center" justify="center" class="min-h-[200px]">
          <a-spin />
        </a-flex>
      </a-col>
      <template v-else>
        <a-col v-for="item of data" :key="item.id" :sm="8" :xl="6" :xxl="4">
          <comic-item :comic="item"></comic-item>
        </a-col>
      </template>
      <a-col v-if="page > 1 || !loading" :span="24">
        <a-button
          type="primary"
          block
          size="large"
          :loading="loading"
          @click="page++"
        >
          加载更多
        </a-button>
      </a-col>
    </a-row>
  </a-card>
</template>
