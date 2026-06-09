<script setup lang="ts">
defineProps<{
  error: Error
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div
    class="wind-flex wind-flex-col wind-items-center wind-inset-0 wind-justify-center wind-absolute"
  >
    <div class="wind-max-w-70%">
      <v-row>
        <v-col :cols="12">
          <v-alert color="error" icon="$error" title="卧槽，竟然报错了！">
            <template #text>
              <div class="wind-ws-pre-wrap wind-mt-2">
                {{ error.stack }}
              </div>
            </template>
          </v-alert>
        </v-col>
        <v-col :cols="12">
          <v-btn size="large" block color="primary" @click="$emit('retry')">
            <template #prepend>
              <v-icon>
                <i-mdi-circle-arrows />
              </v-icon>
            </template>
            重试
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
