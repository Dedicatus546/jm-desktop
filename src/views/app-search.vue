<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";

const queryStr = ref("");

const { page, total, data, send, loading } = usePagination(
  (page) => getComicListApi(queryStr.value, page),
  {
    immediate: false,
    data: (res) => res.data.content,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-input-search
        v-model:value="queryStr"
        size="large"
        placeholder="车牌号，名称，作者"
        enter-button="搜索"
        :disabled="loading"
        @search="send(1, 0)"
      />
    </a-col>
    <a-col :span="24">
      <a-spin :spinning="loading">
        <a-row v-if="total" :gutter="[16, 16]">
          <a-col v-for="item of data" :key="item.id" :sm="8" :xl="6" :xxl="4">
            <comic-item :comic="item" />
          </a-col>
          <a-col :span="24">
            <a-pagination
              v-model:current="page"
              align="center"
              :page-size="80"
              :total="total"
              show-quick-jumper
              :show-size-changer="false"
            />
          </a-col>
        </a-row>
        <a-col v-else :span="24">
          <a-card>
            <a-empty>
              <a-typography-text type="secondary">
                使用上面的搜索框来搜索作品
              </a-typography-text>
            </a-empty>
          </a-card>
        </a-col>
      </a-spin>
    </a-col>
  </a-row>
</template>

<style scoped></style>
