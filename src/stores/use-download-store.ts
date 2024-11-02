import { WatchHandle } from "vue";

import { BaseComic } from "@/types";

interface PendingItem extends BaseComic {
  loaded: number;
  total: number;
}

interface State {
  pendingMap: Map<
    number,
    PendingItem & {
      watchHandler?: WatchHandle;
    }
  >;
}

const useDownloadStore = defineStore("download", () => {
  const state = reactive<State>({
    pendingMap: new Map(),
  });

  const pendingList = computed(() => [...state.pendingMap.values()]);

  const addDownloadAction = (item: Omit<PendingItem, "loaded">) => {
    if (state.pendingMap.has(item.id)) {
      return;
    }
    state.pendingMap.set(item.id, {
      ...item,
      loaded: 0,
    });
  };

  const updateDonwloadProgressAction = (
    id: number,
    loaded: ComputedRef<number>,
  ) => {
    if (!state.pendingMap.has(id)) {
      // TODO
      return;
    }
    const item = state.pendingMap.get(id)!;
    item.watchHandler = watchEffect(() => {
      item.loaded = loaded.value;
    });
  };

  const removeDownloadAction = (id: number) => {
    if (!state.pendingMap.has(id)) {
      // TODO
      return;
    }
    const item = state.pendingMap.get(id)!;
    item.watchHandler?.();
    state.pendingMap.delete(id);
  };

  return {
    ...toRefs(state),
    pendingList,
    addDownloadAction,
    updateDonwloadProgressAction,
    removeDownloadAction,
  };
});

export default useDownloadStore;
