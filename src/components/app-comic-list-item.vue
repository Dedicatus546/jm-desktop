<script setup lang="ts">
import useAppStore from '@/stores/use-app-store'

const props = withDefaults(
  defineProps<{
    comic: {
      id: number
      name: string
      author: string
    }
    replace?: boolean
  }>(),
  {
    replace: false,
  },
)

const appStore = useAppStore()
const route = useRoute()

const cover = computed(() =>
  import.meta.env.VITE_NSFW === 'on'
    ? '/360x640.svg'
    : `${appStore.setting.imgHost}/media/albums/${props.comic.id}_3x4.jpg`,
)

const visibleRef = useTemplateRef('visibleRef')
const isVisible = useElementVisibility(visibleRef, {
  once: true,
  rootMargin: '100px 0px 100px 0px',
  scrollTarget() {
    return document.getElementById('scroll-view')
  },
})
const isInside = ref(false)
watch(isVisible, (nVal, oVal) => {
  if (oVal || nVal) {
    isInside.value = true
  }
},
{
  immediate: true,
})
</script>

<template>
  <router-link
    class="wind-relative"
    :to="{ name: 'COMIC_DETAIL', params: { id: comic.id }, replace }"
  >
    <v-card color="primary" v-if="isInside">
      <v-img
        :aspect-ratio="3 / 4"
        cover
        :alt="`${comic.name}的封面`"
        :src="cover"
      />
      <v-card-item>
        <v-card-title>{{ comic.name }}</v-card-title>
        <v-card-subtitle class="wind-cursor-default">
          <app-scroll-wrapper
            v-if="comic.author && route.name !== 'QUICK_SEARCH'"
          >
            <router-link
              :to="{
                name: 'QUICK_SEARCH',
                query: { query: comic.author },
                replace: route.name === 'QUICK_SEARCH',
              }"
            >
              {{ comic.author }}
            </router-link>
          </app-scroll-wrapper>
          <template v-else>未知作者</template>
        </v-card-subtitle>
      </v-card-item>
    </v-card>
    <div class="wind-aspect-ratio-[0.57978]" v-else></div>
    <div class="wind-pointer-events-none wind-inset-0 wind-absolute" ref="visibleRef"></div>
  </router-link>
</template>

<style scoped></style>
