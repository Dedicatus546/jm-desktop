<script setup lang="ts">
defineProps<{
  comicId: number;
  picList: Array<string>;
}>();
</script>

<template>
  <div class="absolute inset-0">
    <div class="absolute inset-0 p-4 overflow-auto">
      <comic-vertical-pic
        v-for="item of picList"
        :key="item"
        :comic-id="comicId"
        :src="item"
      />
    </div>
    <!-- TODO -->
    <!-- <div class="absolute bottom-4 inset-x-4">
      <a-card size="small">
        <div>test</div>
      </a-card>
    </div> -->
  </div>
</template>
