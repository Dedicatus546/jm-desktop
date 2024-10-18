<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";

const formState = reactive({
  content: "",
  type: "mr",
});

const { page, total, data, send, loading } = usePagination(
  (page) =>
    getComicListApi({
      page,
      content: formState.content,
      type: formState.type,
    }),
  {
    immediate: false,
    data: (res) => res.data.content,
    total: (res) => res.data.total,
    watchingStates: [() => formState.type],
  },
);
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-input-search
        v-model:value="formState.content"
        size="large"
        placeholder="车牌号，名称，作者"
        enter-button="搜索"
        :disabled="loading"
        @search="send(1, 0)"
      >
        <template #addonBefore>
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
        </template>
      </a-input-search>
    </a-col>
    <a-col :span="24">
      <a-card>
        <a-spin :spinning="loading">
          <a-row v-if="total" :gutter="[16, 16]">
            <a-col v-for="item of data" :key="item.id" :sm="8" :xl="6" :xxl="4">
              <comic-item :comic="item" />
            </a-col>
            <a-col :span="24">
              <a-pagination
                v-model:current="page"
                align="right"
                :page-size="80"
                :total="total"
                show-quick-jumper
                :show-size-changer="false"
              />
            </a-col>
          </a-row>
          <a-col v-else :span="24">
            <a-empty>
              <a-typography-text type="secondary">
                使用上面的搜索框来搜索作品
              </a-typography-text>
            </a-empty>
          </a-col>
        </a-spin>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped></style>
