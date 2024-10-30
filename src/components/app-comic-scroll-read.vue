<script setup lang="ts">
defineProps<{
  comicId: number;
  picList: Array<string>;
}>();

const sliderValue = ref(0);
const comicVerticalPicListRef = ref<Array<{ scrollIntoView: () => void }>>([]);

const onSliderEnd = (value: number) => {
  const index = value - 1;
  comicVerticalPicListRef.value?.[index].scrollIntoView();
};
</script>

<template>
  <div class="absolute inset-0">
    <div class="absolute inset-0 p-4 overflow-auto">
      <comic-vertical-pic
        v-for="(item, index) of picList"
        ref="comicVerticalPicListRef"
        :key="item"
        :comic-id="comicId"
        :src="item"
        @intersect="sliderValue = index + 1"
      />
    </div>
    <div class="absolute bottom-4 inset-x-4">
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
            <template #append>
              <div class="flex items-center gap-2">
                <shunt-select />
                <div>{{ sliderValue }} / {{ picList.length }}</div>
              </div>
            </template>
          </v-slider>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
