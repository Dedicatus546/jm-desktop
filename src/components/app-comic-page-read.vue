<script setup lang="ts">
const props = defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const page = ref(0);

onActivated(() => {
  page.value = 0;
});

const hasLastPage = computed(() => page.value > 0);
const lastPage = () => {
  if (page.value === 0) {
    return;
  }
  page.value--;
};

const hasNextPage = computed(() => page.value < props.picList.length - 1);
const nextPage = () => {
  if (page.value === props.picList.length - 1) {
    return;
  }
  page.value++;
};

onKeyStroke("ArrowRight", () => nextPage(), {
  dedupe: true,
});
onKeyStroke("ArrowLeft", () => lastPage(), {
  dedupe: true,
});
</script>

<template>
  <div class="absolute inset-4">
    <a-flex vertical class="h-full" :gap="16">
      <div class="flex-grow min-h-0">
        <comic-page-pic
          :key="picList[page]"
          :comic-id="comicId"
          :src="picList[page]"
        />
      </div>
      <a-row class="flex-shrink-0" :gutter="[16, 16]">
        <a-col :span="12">
          <a-button
            block
            size="large"
            :disabled="!hasLastPage"
            @click="lastPage"
          >
            上一页
          </a-button>
        </a-col>
        <a-col :span="12">
          <a-button
            block
            size="large"
            :disabled="!hasNextPage"
            @click="nextPage"
          >
            下一页
          </a-button>
        </a-col>
      </a-row>
    </a-flex>
  </div>
</template>
