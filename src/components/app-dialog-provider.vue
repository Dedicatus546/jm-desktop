<script setup lang="ts">
import {
  DialogInstanceOptions,
  dialogProviderInjectKey,
  DialogProviderInjectType,
} from '@/types'
import { delay } from '@/utils'

let id = 0

const instanceList = ref<Array<DialogInstanceOptions>>([])

const provideValue: DialogProviderInjectType = (options) => {
  const instance = reactive({
    id: id++,
    modelValue: true,
    width: options.width,
    title: options.title,
    content: options.content,
    okText: options.okText ?? '确认',
    okLoading: false,
    cancelText: options.cancelText ?? '取消',
    cancelLoading: false,
    onOk: async () => {
      if (options.onOk) {
        instance.okLoading = true
        try {
          await options.onOk()
        }
        catch (e) {
          console.error(e)
        }
        instance.okLoading = false
      }
      instance.modelValue = false
    },
    onCancel: async () => {
      if (options.onCancel) {
        instance.cancelLoading = true
        try {
          await options.onCancel()
        }
        catch (e) {
          console.error(e)
        }
        instance.cancelLoading = false
      }
      instance.modelValue = false
    },
  })
  instanceList.value.push(instance)
}

provide<DialogProviderInjectType>(dialogProviderInjectKey, provideValue)

const removeInstance = async (id: number) => {
  delay(1000)
  const index = instanceList.value.findIndex(instance => instance.id === id)
  if (index > -1) {
    instanceList.value.splice(index, 1)
  }
}
</script>

<template>
  <slot></slot>
  <v-dialog
    v-for="instance of instanceList"
    :key="instance.id"
    v-model:model-value="instance.modelValue"
    :width="instance.width"
    @after-leave="removeInstance(instance.id)"
  >
    <v-card :title="instance.title">
      <v-card-text>
        {{ instance.content }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :loading="instance.cancelLoading"
          :text="instance.cancelText"
          @click="instance.onCancel"
        ></v-btn>
        <v-btn
          :loading="instance.okLoading"
          color="primary"
          :text="instance.okText"
          @click="instance.onOk"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
