<script setup lang="ts">
import { useRequest } from 'alova/client'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import { AlovaXHRResponse, xhrRequestAdapter } from '@alova/adapter-xhr'
import { useConfigStore } from '@/stores/use-config-store'
import useSnackbar from '@/compositions/use-snack-bar'
import { log } from '@/utils/logger'

const { error } = log
const snackbar = useSnackbar()
const configStore = useConfigStore()
const alovaInstance = createAlova({
  statesHook: vueHook,
  requestAdapter: xhrRequestAdapter(),
})

const { data, send } = useRequest(
  () =>
    alovaInstance.Get<AlovaXHRResponse<Array<string>>>('https://proxy-api.prohibitorum.top/jm-api'),
  {
    immediate: false,
  },
)

const loading = ref(false)
const refresh = async () => {
  try {
    loading.value = true
    await send()
    await configStore.updateConfigAction({
      apiUrlList: data.value.data,
    })
    snackbar.success('刷新成功')
  } catch (e) {
    error('刷新接口失败，原因', e)
    snackbar.error('刷新失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-btn :loading class="wind-ml-auto" variant="flat" color="primary" @click="refresh()">
    <template #prepend>
      <v-icon>
        <i-mdi-refresh />
      </v-icon>
    </template>
    刷新接口
  </v-btn>
</template>
