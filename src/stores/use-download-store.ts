interface PendingItem {
  id: number;
  author: string;
  name: string;
  loaded: number;
  total: number;
}

interface State {
  pendingMap: Map<number, PendingItem>;
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

  const updateDonwloadProgressAction = (id: number, loaded: number) => {
    if (!state.pendingMap.has(id)) {
      // TODO
      return;
    }
    const item = state.pendingMap.get(id)!;
    item.loaded = loaded;
  };

  const removeDownloadAction = (id: number) => {
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
