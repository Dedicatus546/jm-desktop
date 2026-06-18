<script setup lang="ts">
import useSnackbar from '@/compositions/use-snack-bar'
import { emitter } from '@/utils/mitt'

const snackbar = useSnackbar()

onMounted(() => {
  emitter.on('DownloadSuccess', (item) => {
    const name = `${item.comicName}-${item.chapterName}`
    snackbar.success(`${name} 下载成功`)
  })
})
</script>

<template>
  <div class="wind-hidden wind-absolute"></div>
</template>
