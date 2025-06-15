<script setup lang="ts">
const props = defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const page = ref(0); // [0, picList.length - 1]
const sliderValue = ref(1); // [1, picList.length]

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

const onDecodeSuccess = inject<(index: number) => void>(
  "onDecodeSuccess",
  () => {},
);

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
  <div class="wind-absolute wind-inset-0">
    <div class="wind-flex wind-flex-col wind-h-full wind-gap-4">
      <div
        v-if="picList.length > 0"
        class="wind-flex-grow wind-min-h-0 wind-p-4"
      >
        <comic-page-pic
          :key="picList[page]"
          :comic-id="comicId"
          :src="picList[page]"
          @decode-success="onDecodeSuccess(page)"
        />
      </div>
      <div class="wind-flex-shrink-0">
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
                <div class="wind-flex wind-items-center gap-2">
                  <div>{{ sliderValue }} / {{ picList.length }}</div>
                  <app-shunt-select />
                  <div class="wind-flex-shrink-0"></div>
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
