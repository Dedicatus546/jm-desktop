<script setup lang="ts">
import { usePagination } from "alova/client";

// TODO fix 这个接口好像没有翻页的
import { getHistoryComicListApi } from "@/apis";

const { page, total, loading, data } = usePagination(
  (page) =>
    getHistoryComicListApi({
      page,
    }),
  {
    initialPage: 1,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <a-spin :spinning="loading">
    <a-row :gutter="[16, 16]">
      <a-col v-for="item of data" :key="item.id" :sm="8" :xl="6" :xxl="4">
        <comic-item :comic="item" />
      </a-col>
      <a-col v-if="false" :span="24">
        <a-pagination
          v-model:current="page"
          align="right"
          :page-size="20"
          :total="total"
          :show-size-changer="false"
        />
      </a-col>
    </a-row>
  </a-spin>
</template>

<style scoped></style>
