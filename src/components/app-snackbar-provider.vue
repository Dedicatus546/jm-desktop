<script setup lang="ts">
import { CSSProperties } from "vue";
import { VFadeTransition, type VSnackbar } from "vuetify/components";

import {
  injectKey,
  isSnackbarTopInstance,
  SnackbarBaseInstance,
  SnackbarBottomInstance,
  SnackbarInjectValue,
  SnackbarInstance,
  SnackbarLocation,
  SnackbarOptions,
  SnackbarTopInstance,
} from "@/types";

const defaultSnackbarOptions: SnackbarOptions = {
  color: "primary",
  location: "top center",
  timeout: 5000,
  variant: "elevated",
};

const componentOptions = withDefaults(defineProps<SnackbarOptions>(), {
  color: "primary",
  location: "top center",
  timeout: 5000,
  variant: "elevated",
});

let id = 0;

const instanceLocationMap = ref<
  Record<SnackbarLocation, Array<SnackbarInstance> | null>
>({
  "top left": null,
  "top center": null,
  "top right": null,
  "bottom left": null,
  "bottom center": null,
  "bottom right": null,
});
const instanceDomMap = ref<Map<number, HTMLElement>>(new Map());

const updateDom = (id: SnackbarInstance["id"], ref: VSnackbar | null) => {
  nextTick(() => {
    const dom = ref ? ref.contentEl : null;
    if (!dom) {
      instanceDomMap.value.delete(id);
      return;
    }
    instanceDomMap.value.set(id, dom);
  });
};

const locationList = computed<Array<SnackbarLocation>>(
  () => Object.keys(instanceLocationMap.value) as SnackbarLocation[],
);

const remove = (instance: SnackbarInstance) => {
  const { id, location } = instance;
  const instanceList = instanceLocationMap.value[location!];
  if (!instanceList) {
    return;
  }
  const index = instanceList.findIndex((inst) => inst.id === id);
  if (index > -1) {
    patchPosition(instanceList[index], index);
    instanceList.splice(index, 1);
  }
};

const close = (
  id: SnackbarInstance["id"],
  location: SnackbarInstance["location"],
) => {
  const instanceList = instanceLocationMap.value[location];
  if (!instanceList) {
    return;
  }
  const index = instanceList.findIndex((inst) => inst.id === id);
  if (index > -1) {
    instanceList[index].modelValue = false;
  }
};

const patchPosition = (removeInst: SnackbarInstance, index: number) => {
  const { location } = removeInst;
  const instanceList = instanceLocationMap.value[location];
  if (!instanceList) {
    return;
  }
  if (isSnackbarTopInstance(removeInst)) {
    const topInstanceList = instanceList as Array<SnackbarTopInstance>;
    for (let i = topInstanceList.length - 1; i > index; i--) {
      topInstanceList[i].top = topInstanceList[i - 1].top;
    }
  } else {
    const bottomInstanceList = instanceList as Array<SnackbarBottomInstance>;
    for (let i = bottomInstanceList.length - 1; i > index; i--) {
      bottomInstanceList[i].bottom = bottomInstanceList[i - 1].bottom;
    }
  }
};

const getNextDistance = (inst: SnackbarBaseInstance, gutter: number = 10) => {
  const location = inst.location;
  const instanceList = instanceLocationMap.value[location];
  if (instanceList === null) {
    return 0;
  }
  return instanceList
    .map((inst) => instanceDomMap.value.get(inst.id))
    .reduce<number>((pos, el) => {
      return pos + (el ? el.offsetHeight : 0) + gutter;
    }, 0);
};

const getStyle = (inst: SnackbarInstance) => {
  const style = {
    transition: "top .3s, bottom .3s",
  } as CSSProperties;
  if (isSnackbarTopInstance(inst)) {
    style.top = inst.top + "px";
  } else {
    style.bottom = inst.bottom + "px";
  }
  return style;
};

const snackbar: SnackbarInjectValue = ((text, messageOptions) => {
  const configs = {} as SnackbarOptions;
  Object.assign(
    configs,
    defaultSnackbarOptions,
    componentOptions,
    messageOptions,
  );

  const location = configs.location!;

  let instanceList = instanceLocationMap.value[location];
  if (instanceList === null) {
    instanceList = instanceLocationMap.value[location] = [];
  }

  const instanceId = id++;
  const messageInstance: SnackbarInstance = {
    id: instanceId,
    modelValue: true,
    location,
    text,
    color: configs.color!,
    timeout: configs.timeout!,
    variant: configs.variant!,
  } as SnackbarInstance;
  const nextPostion = getNextDistance(messageInstance);
  if (isSnackbarTopInstance(messageInstance)) {
    messageInstance.top = nextPostion;
  } else {
    messageInstance.bottom = nextPostion;
  }

  instanceList.push(messageInstance as SnackbarInstance);

  return {
    close: () => {
      close(messageInstance.id, messageInstance.location);
    },
  };
}) as SnackbarInjectValue;

(["primary", "success", "warning", "error"] as const).forEach((key) => {
  snackbar[key] = (text, config) => {
    config = Object.assign({}, config, {
      color: key,
    });
    return snackbar(text, config);
  };
});

provide<SnackbarInjectValue>(injectKey, snackbar);
</script>

<template>
  <slot></slot>
  <template v-for="location of locationList" :key="location">
    <!-- close-on-back 必须设置为 false -->
    <!-- 不然 router.back 会无效 -->
    <!-- https://github.com/vuetifyjs/vuetify/issues/18283 -->
    <v-snackbar
      v-for="inst of instanceLocationMap[location]"
      :ref="
        (el: any) => {
          updateDom(inst.id, el);
        }
      "
      :key="inst.id"
      :close-on-back="false"
      :style="getStyle(inst)"
      :model-value="inst.modelValue"
      :location="inst.location"
      :color="inst.color"
      :timeout="inst.timeout"
      :variant="inst.variant"
      :transition="{
        onAfterLeave: () => remove(inst),
        component: VFadeTransition,
      }"
    >
      <template v-if="typeof inst.text === 'string'">
        {{ inst.text }}
      </template>
      <component :is="inst.text" v-else></component>
    </v-snackbar>
  </template>
</template>
