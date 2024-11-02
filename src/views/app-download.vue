<script setup lang="ts">
const activeTabKey = ref<"pending" | "complete">("pending");
const tabList = [
  {
    value: "pending",
    tab: "正在下载",
  },
  {
    value: "complete",
    tab: "已下载",
  },
];
</script>

<template>
  <v-card>
    <v-tabs v-model:model-value="activeTabKey" bg-color="primary">
      <v-tab v-for="item of tabList" :key="item.value" :value="item.value">
        {{ item.tab }}
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-window v-model:model-value="activeTabKey">
        <v-tabs-window-item value="pending">
          <app-download-pending-list />
        </v-tabs-window-item>
        <v-tabs-window-item value="complete">
          <app-download-complete-list />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<style scoped></style>
