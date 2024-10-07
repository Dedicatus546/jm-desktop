<script setup lang="ts"></script>

<template>
  <a-card class="comic-item-skeleton">
    <template #cover>
      <a-skeleton-image class="comic-item-cover-skeleton aspect-[3/4]" />
    </template>
    <a-skeleton
      active
      :title="{
        width: '100%',
      }"
      :paragraph="false"
    ></a-skeleton>
  </a-card>
</template>

<style scoped lang="less">
.comic-item-skeleton {
  .comic-item-cover-skeleton {
    width: 100%;

    :deep(.ant-skeleton-image) {
      width: 100%;
      height: 100%;
      line-height: 1;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  :deep(.ant-skeleton-title) {
    margin-bottom: 0;
  }
}
</style>
