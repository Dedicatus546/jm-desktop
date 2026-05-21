<script setup lang="ts">
import { useConfigStore } from '@/stores/use-config-store'
import { usePrefetchDataStore } from '@/stores/use-prefetch-data-store'

const configStore = useConfigStore()
const prefetchDataStore = usePrefetchDataStore()

const updateCurrentShuntKey = (value: number) => {
  configStore.updateConfigAction({
    currentShuntKey: value,
  })
}
</script>

<template>
  <v-select
    color="primary"
    variant="outlined"
    hide-details
    :model-value="configStore.state.currentShuntKey"
    class="wind-w-[150px]"
    :items="prefetchDataStore.state.shuntList"
    item-title="title"
    item-value="key"
    @update:model-value="updateCurrentShuntKey"
  >
  </v-select>
</template>
