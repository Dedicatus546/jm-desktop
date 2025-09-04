<script setup lang="ts"></script>

<template>
  <div class="app-skeleten wind-bg-[rgba(var(--v-theme-on-surface),var(--v-border-opacity))] wind-rounded-[4px]!">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.app-skeleten {
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: loading 1.5s infinite;
    background: linear-gradient(90deg,rgba(var(--v-theme-surface),0),rgba(var(--v-theme-surface),.3),rgba(var(--v-theme-surface),0));
    transform: translate(-100%);
    z-index: 1;
  }
}

@keyframes loading {
  100% {
    transform: translateX(100%);
  }
}
</style>
