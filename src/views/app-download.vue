<script setup lang="ts">
const activeTabKey = ref<"pending" | "complete">("pending");
const tabList = [
  {
    key: "pending",
    tab: "正在下载",
  },
  {
    key: "complete",
    tab: "已下载",
  },
];
</script>

<template>
  <a-card
    :tab-list="tabList"
    :active-tab-key="activeTabKey"
    @tab-change="(key) => (activeTabKey = key as any)"
  >
    <app-download-pending-list v-if="activeTabKey === 'pending'" />
    <app-download-complete-list v-else-if="activeTabKey === 'complete'" />
  </a-card>
</template>

<style scoped></style>
