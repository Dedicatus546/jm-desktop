<script setup lang="ts">
import { usePagination } from "alova/client";

import { getUserCommentListApi } from "@/apis";
import useUserStore from "@/stores/use-user-store";

const userStore = useUserStore();
const { page, total, loading, data } = usePagination(
  (page) => getUserCommentListApi(page, userStore.userInfo!.uid),
  {
    initialPage: 1,
    data: (res) => res.data.list,
    total: (res) => res.data.total,
  },
);
</script>

<template>
  <a-spin :spinning="loading">
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
  </a-spin>
</template>

<style scoped></style>
