<script setup lang="ts">
import useAppStore from '@/stores/use-app-store'
const appStore = useAppStore()

const updateCurrentShuntKey = (value: number) => {
  appStore.updateConfigAction(
    {
      currentShuntKey: value as number,
    },
    true,
  )
}
</script>

<template>
  <v-select
    color="primary"
    variant="outlined"
    hide-details
    :model-value="appStore.config.currentShuntKey"
    class="wind-w-[150px]"
    :items="appStore.setting.shuntList"
    item-title="title"
    item-value="key"
    @update:model-value="updateCurrentShuntKey"
  >
  </v-select>
</template>
