<script setup lang="ts">
const props = defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const page = ref(0); // [0, picList.length - 1]
const sliderValue = ref(1); // [1, picList.length]

onActivated(() => {
  page.value = 0;
});

const hasLastPage = computed(() => page.value > 0);
const lastPage = () => {
  if (page.value === 0) {
    return;
  }
  page.value--;
  sliderValue.value = page.value + 1;
};

const hasNextPage = computed(() => page.value < props.picList.length - 1);
const nextPage = () => {
  if (page.value === props.picList.length - 1) {
    return;
  }
  page.value++;
  sliderValue.value = page.value + 1;
};

onKeyStroke("ArrowRight", () => nextPage(), {
  dedupe: true,
});
onKeyStroke("ArrowLeft", () => lastPage(), {
  dedupe: true,
});

const onSliderEnd = (value: [number, number] | number) => {
  page.value = (value as number) - 1;
};
</script>

<template>
  <div class="absolute inset-0">
    <div class="flex flex-col h-full gap-4">
      <div v-if="picList.length > 0" class="flex-grow min-h-0 p-4">
        <comic-page-pic
          :key="picList[page]"
          :comic-id="comicId"
          :src="picList[page]"
        />
      </div>
      <div class="flex-shrink-0">
        <v-card>
          <v-card-text>
            <v-slider
              v-model:model-value="sliderValue"
              hide-details
              :step="1"
              color="primary"
              :min="1"
              :max="picList.length"
              @end="onSliderEnd"
            >
              <template #prepend>
                <v-btn
                  color="primary"
                  icon="mdi-arrow-left"
                  size="large"
                  :disabled="!hasLastPage"
                  @click="lastPage"
                ></v-btn>
              </template>
              <template #append>
                <div class="flex items-center gap-2">
                  <div>{{ sliderValue }} / {{ picList.length }}</div>
                  <shunt-select />
                  <div class="flex-shrink-0"></div>
                  <v-btn
                    color="primary"
                    icon="mdi-arrow-right"
                    size="large"
                    :disabled="!hasNextPage"
                    @click="nextPage"
                  >
                  </v-btn>
                </div>
              </template>
            </v-slider>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>
