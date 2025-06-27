import { WatchHandle } from "vue";

interface PendingItem {
  id: number;
  name: string;
  author: string;
  fileName: string;
  belongId: number;
  seriesName: string;
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

  // state.pendingMap.set(1044048, {
  //   author: "森宫正幸",
  //   belongId: 1044048,
  //   seriesName: "",
  //   fileName:
  //     "[JM1044048] (C105) [森宫罐 (森宫正幸)] 变态黒髪ちゃんと生涯モブの僕 [中国翻译] [DL版] [禁漫去码].zip",
  //   id: 1044048,
  //   loaded: 5000000,
  //   name: "(C105) [森宫罐 (森宫正幸)] 变态黒髪ちゃんと生涯モブの僕 [中国翻译] [DL版] [禁漫去码]",
  //   total: 6710886.4,
  // });
  // state.pendingMap.set(1044049, {
  //   author: "森宫正幸",
  //   belongId: 1044048,
  //   seriesName: "第二话",
  //   fileName:
  //     "[JM1044048] (C105) [森宫罐 (森宫正幸)] 变态黒髪ちゃんと生涯モブの僕 [中国翻译] [DL版] [禁漫去码].zip",
  //   id: 1044049,
  //   loaded: 5000000,
  //   name: "(C105) [森宫罐 (森宫正幸)] 变态黒髪ちゃんと生涯モブの僕 [中国翻译] [DL版] [禁漫去码]",
  //   total: 6710886.4,
  // });

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
