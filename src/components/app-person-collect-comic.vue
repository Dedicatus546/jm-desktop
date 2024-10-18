<script setup lang="ts">
import { usePagination } from "alova/client";

import { getCollectComicListApi } from "@/apis";

const formState = reactive({
  type: "mr",
});

const { page, total, loading, data } = usePagination(
  (page) =>
    getCollectComicListApi({
      page,
      type: formState.type,
    }),
  {
    initialPage: 1,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
    watchingStates: [() => formState.type],
  },
);
</script>

<template>
  <a-spin :spinning="loading">
    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-flex justify="end">
          <a-select
            v-model:value="formState.type"
            size="large"
            class="w-[140px]"
          >
            <a-select-option value="mr">最新</a-select-option>
            <a-select-option value="mv">最多收藏</a-select-option>
            <a-select-option value="mp">最多图片</a-select-option>
            <a-select-option value="tf">最多爱心</a-select-option>
          </a-select>
        </a-flex>
      </a-col>
      <a-col v-for="item of data" :key="item.id" :sm="8" :xl="6" :xxl="4">
        <comic-item :comic="item" />
      </a-col>
      <a-col :span="24">
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
