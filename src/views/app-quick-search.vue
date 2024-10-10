<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicListApi } from "@/apis";

const props = defineProps<{
  query: string;
}>();

const { page, total, data, loading } = usePagination(
  (page) => getComicListApi(props.query, page),
  {
    data: (res) => res.data.content,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col :span="24">
      <a-typography-title :level="5" class="mb-0!">
        搜索：{{ props.query }}
      </a-typography-title>
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
            <a-empty></a-empty>
          </a-card>
        </a-col>
      </a-spin>
    </a-col>
  </a-row>
</template>

<style scoped></style>
