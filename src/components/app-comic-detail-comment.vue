<script setup lang="ts">
import { usePagination } from "alova/client";

import { getComicCommentListApi } from "@/apis";

const props = defineProps<{
  comicId: number;
}>();

const { loading, page, total, data } = usePagination(
  (page) =>
    getComicCommentListApi({
      page,
      comicId: props.comicId,
    }),
  {
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <a-list
    item-layout="vertical"
    size="large"
    :loading="loading"
    :pagination="{
      current: page,
      onChange: (newPage: number) => (page = newPage),
      total,
      pageSize: 10,
      showSizeChanger: false,
    }"
    :data-source="data"
  >
    <template #renderItem="{ item, index }">
      <a-divider v-if="index > 0" />
      <comment-item :key="item.id" :comment="item" />
    </template>
  </a-list>
</template>

<style scoped></style>
