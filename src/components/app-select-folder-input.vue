<script setup lang="ts">
import { trpcClient } from "@/apis/ipc";

const value = defineModel<string>("modelValue");
const loading = ref(false);

const changeDownloadDir = async () => {
  const dir = await trpcClient.selectFolder.query();
  value.value = dir;
};
</script>

<template>
  <v-text-field
    hide-details
    label="下载位置"
    :model-value="value"
    placeholder="选择下载位置"
    readonly
  >
    <template #append-inner>
      <v-btn :loading="loading" color="primary" @click="changeDownloadDir">
        更换
      </v-btn>
    </template>
  </v-text-field>
</template>

<style scoped></style>
