<script setup lang="ts">
import { Form } from "ant-design-vue";

import { selectFolderIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";

const formContext = Form.useInjectFormItemContext();
const value = defineModel<string>("value");

const { loading, data, invoke } = useIpcRendererInvoke<string>(
  () => selectFolderIpc(),
  {
    immediate: false,
  },
);

const changeDownloadDir = async () => {
  await invoke();
  value.value = data.value!;
  formContext.onFieldChange();
};
</script>

<template>
  <a-space-compact block size="large">
    <a-input v-model:value="value" placeholder="选择下载位置" read-only />
    <a-button :loading="loading" type="primary" @click="changeDownloadDir">
      更换
    </a-button>
  </a-space-compact>
</template>

<style scoped></style>
