<script setup lang="ts">
import { trpcClient } from '@/apis'
import useSnackbar from '@/compositions/use-snack-bar'
import type { Unsubscribable } from '@trpc/server/observable'

const snackbar = useSnackbar()
const unSubscribableList: Array<Unsubscribable> = []

onMounted(() => {
  if (WINDOW_ID === 'main') {
    unSubscribableList.push(
      trpcClient.onNotifyMessage.subscribe(undefined, {
        onData({ type, message }) {
          snackbar[type](message)
        },
      }),
    )
  }
})

onUnmounted(() => {
  if (WINDOW_ID === 'main') {
    unSubscribableList.forEach((ub) => ub.unsubscribe())
  }
})
</script>

<template>
  <div></div>
</template>
