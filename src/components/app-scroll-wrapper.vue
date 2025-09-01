<script setup lang="ts">
// 这个组件可以让内容自动滚动
const containerElRef = useTemplateRef('containerRef')
const innerElRef = useTemplateRef('innerElRef')
const containerElWidth = ref(0)
const innerElWidth = ref(0)

useResizeObserver(containerElRef, ([entry]) => {
  const { width } = entry.contentRect
  containerElWidth.value = width
})

useResizeObserver(innerElRef, ([entry]) => {
  const { width } = entry.contentRect
  innerElWidth.value = width
})

const { play, pause, animate } = useAnimate(
  innerElRef,
  computed(() => {
    return [
      {
        transform: 'translate3d(0, 0, 0)',
        offset: 0,
      },
      {
        transform: 'translate3d(0, 0, 0)',
        offset: 0.3,
      },
      {
        transform: `translate3d(${-innerElWidth.value + containerElWidth.value}px, 0, 0)`,
        offset: 0.5,
      },
      {
        transform: `translate3d(${-innerElWidth.value + containerElWidth.value}px, 0, 0)`,
        offset: 0.8,
      },
      {
        transform: 'translate3d(0, 0, 0)',
        offset: 1,
      },
    ]
  }),
  {
    immediate: false,
    duration: 1000,
    iterations: Infinity,
    easing: 'linear',
  },
)

watch(
  () => [innerElWidth.value, containerElWidth.value],
  ([innerWidth, containerWidth]) => {
    if (innerWidth - containerWidth < 0) {
      pause()
      return
    }
    const duration
      = containerWidth === 0
        ? 0
        : Math.floor(innerWidth / containerWidth) * 10000
    animate.value?.effect?.updateTiming({
      duration: duration <= 0 ? 'auto' : duration,
    })
    play()
  },
)
</script>

<template>
  <div class="wind-max-w-full wind-overflow-hidden" ref="containerRef">
    <div ref="innerElRef" class="wind-flex wind-gap-2 wind-truncate">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
