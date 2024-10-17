const useCallbackList = <T extends (...args: any[]) => void = () => void>() => {
  const callbackList = ref(null) as Ref<Array<T> | null>;

  const addCallback = (callback: T) => {
    if (callbackList.value === null) {
      callbackList.value = [];
    }
    callbackList.value.push(callback);
  };

  const removeCallback = (callback: T) => {
    if (callbackList.value === null) {
      return;
    }
    const index = callbackList.value!.findIndex((item) => item === callback);
    if (index > -1) {
      callbackList.value!.splice(index, 1);
    }
  };

  const call = (...args: any[]) => {
    callbackList.value?.forEach((callback) => callback(...args));
  };

  return {
    addCallback,
    removeCallback,
    call,
  };
};

const useIpcRendererInvoke = <T = any>(
  fn: (...args: any) => Promise<T>,
  config?: {
    immediate: boolean;
  },
) => {
  const loading = ref(false);
  const data = ref<T | null>(null);
  const mergeConfig = Object.assign(
    {
      immediate: true,
    },
    config,
  );
  const { addCallback: addSuccessCallback, call: callSuccessCallback } =
    useCallbackList();
  const { addCallback: addErrorCallback, call: callErrorCallback } =
    useCallbackList<(err: any) => void>();

  const onSuccess = (callback: () => void) => {
    addSuccessCallback(callback);
  };

  const onError = (callback: (err: any) => void) => {
    addErrorCallback(callback);
  };

  const invoke = async (...extraArgs: any[]) => {
    await Promise.resolve(fn(...extraArgs))
      .then(
        (res) => {
          data.value = res;
          callSuccessCallback();
        },
        (err) => {
          callErrorCallback(err);
        },
      )
      .finally(() => {
        loading.value = false;
      });
  };

  if (mergeConfig.immediate) {
    invoke();
  }

  return {
    loading,
    data,
    invoke,
    onSuccess,
    onError,
  };
};

export default useIpcRendererInvoke;
