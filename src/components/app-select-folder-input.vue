<script setup lang="ts">
import { selectFolderIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";

const value = defineModel<string>("modelValue");

const { loading, data, invoke } = useIpcRendererInvoke<string>(
  () => selectFolderIpc(),
  {
    immediate: false,
  },
);

const changeDownloadDir = async () => {
  await invoke();
  value.value = data.value!;
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
