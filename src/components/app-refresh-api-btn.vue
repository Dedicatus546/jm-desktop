<script setup lang="ts">
import { useRequest } from 'alova/client'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import { xhrRequestAdapter } from '@alova/adapter-xhr'
import { useConfigStore } from '@/stores/use-config-store'
import useSnackbar from '@/compositions/use-snack-bar'
import { error } from '@/logger'

const snackbar = useSnackbar()
const configStore = useConfigStore()
const alovaInstance = createAlova({
  statesHook: vueHook,
  requestAdapter: xhrRequestAdapter(),
})

const { data, send } = useRequest(
  () =>
    alovaInstance.Get<Array<string>, string>(
      'https://fastly.jsdelivr.net/gh/Dedicatus546/jm-desktop@main/api.txt',
      {
        transform(data) {
          const urlList = data.split(/\r?\n/)
          return urlList.filter((url) => /^https?:\/\//.test(url))
        },
      },
    ),
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
      apiUrlList: data.value,
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
