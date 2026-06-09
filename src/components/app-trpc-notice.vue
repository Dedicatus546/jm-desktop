<script setup lang="ts">
import { trpcClient } from '@/trpc'
import useSnackbar from '@/compositions/use-snack-bar'
import type { Unsubscribable } from '@trpc/server/observable'
import { WindowId } from '@type/index'

const snackbar = useSnackbar()
const unSubscribableList: Array<Unsubscribable> = []

onMounted(() => {
  if (WINDOW_ID === WindowId.HOME) {
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
  if (WINDOW_ID === WindowId.HOME) {
    unSubscribableList.forEach((ub) => ub.unsubscribe())
  }
})
</script>

<template>
  <div></div>
</template>
