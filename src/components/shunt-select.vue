<script setup lang="ts">
import { updateConfigIpc } from "@/apis";
import useIpcRendererInvoke from "@/compositions/use-ipc-renderer-invoke";
import useAppStore from "@/stores/use-app-store";
const appStore = useAppStore();

const { invoke } = useIpcRendererInvoke(() =>
  updateConfigIpc({ currentShuntKey: appStore.config.currentShuntKey }),
);

const updateCurrentShuntKey = (value: number) => {
  appStore.updateConfigAction({
    currentShuntKey: value as number,
  });
  invoke();
};
</script>

<template>
  <v-select
    hide-details
    :model-value="appStore.config.currentShuntKey"
    class="w-[150px]"
    :items="appStore.setting.shuntList"
    item-title="title"
    item-value="key"
    @update:model-value="updateCurrentShuntKey"
  >
  </v-select>
</template>
