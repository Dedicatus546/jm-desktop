<script setup lang="ts">
import useAppStore from "@/stores/use-app-store";
import useDownloadStore from "@/stores/use-download-store";

const appStore = useAppStore();
const downloadStore = useDownloadStore();
</script>

<template>
  <a-row :gutter="[16, 16]">
    <a-col v-if="downloadStore.pendingList.length === 0" :span="24">
      <a-empty>
        <template #description>
          <a-typography-text type="secondary">
            暂无进行中的下载任务
          </a-typography-text>
        </template>
      </a-empty>
    </a-col>
    <a-col
      v-for="item of downloadStore.pendingList"
      v-else
      :key="item.id"
      :sm="8"
      :xl="6"
      :xxl="4"
    >
      <a-card class="cursor-pointer">
        <template #cover>
          <img
            loading="lazy"
            class="block aspect-[3/4]"
            :alt="`${item.name}的封面`"
            :src="`${appStore.setting.imgHost}/media/albums/${item.id}_3x4.jpg`"
          />
        </template>
        <a-typography-title
          :level="5"
          class="break-all line-clamp-2 min-h-[48px]"
        >
          <a-tooltip :title="item.name">{{ item.name }}</a-tooltip>
        </a-typography-title>
        <a-typography-text class="break-all line-clamp-1">
          <a-tooltip v-if="item.author">
            <template #title>
              {{ item.author }}
            </template>
            {{ item.author }}
          </a-tooltip>
          <template v-else>未知作者</template>
        </a-typography-text>
        <a-progress
          :percent="
            item.total === 0
              ? 0
              : +((item.loaded / item.total) * 100).toFixed(0)
          "
        ></a-progress>
      </a-card>
    </a-col>
  </a-row>
</template>
