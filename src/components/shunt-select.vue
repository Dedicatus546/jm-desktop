<script setup lang="ts">
import { type SelectValue } from "ant-design-vue/es/select";

import { updateConfigIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useAppStore from "@/stores/use-app-store";
const appStore = useAppStore();

const { invoke } = useIpcRendererInvoke(() =>
  updateConfigIpc({ currentShuntKey: appStore.config.currentShuntKey }),
);

const updateCurrentShuntKey = (value: SelectValue) => {
  appStore.updateConfigAction({
    currentShuntKey: value as number,
  });
  invoke();
};
</script>

<template>
  <a-select
    :value="appStore.config.currentShuntKey"
    class="w-[80px]"
    @update:value="updateCurrentShuntKey"
  >
    <a-select-option v-for="item of appStore.setting.shuntList" :key="item.key">
      {{ item.title }}
    </a-select-option>
  </a-select>
</template>
